// gitserver is the gitserver server.
package shared

import (
	"container/list"
	"context"
	"database/sql"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	jsoniter "github.com/json-iterator/go"
	"github.com/sourcegraph/log"
	"golang.org/x/sync/semaphore"
	"golang.org/x/time/rate"
	"google.golang.org/grpc"

	"github.com/sourcegraph/sourcegraph/cmd/gitserver/server"
	"github.com/sourcegraph/sourcegraph/cmd/gitserver/server/accesslog"
	"github.com/sourcegraph/sourcegraph/cmd/gitserver/server/perforce"
	"github.com/sourcegraph/sourcegraph/internal/actor"
	"github.com/sourcegraph/sourcegraph/internal/api"
	"github.com/sourcegraph/sourcegraph/internal/authz"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/dependencies"
	"github.com/sourcegraph/sourcegraph/internal/collections"
	"github.com/sourcegraph/sourcegraph/internal/conf"
	"github.com/sourcegraph/sourcegraph/internal/conf/conftypes"
	"github.com/sourcegraph/sourcegraph/internal/database"
	connections "github.com/sourcegraph/sourcegraph/internal/database/connections/live"
	"github.com/sourcegraph/sourcegraph/internal/encryption/keyring"
	"github.com/sourcegraph/sourcegraph/internal/env"
	"github.com/sourcegraph/sourcegraph/internal/extsvc"
	"github.com/sourcegraph/sourcegraph/internal/extsvc/crates"
	"github.com/sourcegraph/sourcegraph/internal/extsvc/gomodproxy"
	"github.com/sourcegraph/sourcegraph/internal/extsvc/npm"
	"github.com/sourcegraph/sourcegraph/internal/extsvc/pypi"
	"github.com/sourcegraph/sourcegraph/internal/extsvc/rubygems"
	proto "github.com/sourcegraph/sourcegraph/internal/gitserver/v1"
	"github.com/sourcegraph/sourcegraph/internal/goroutine"
	internalgrpc "github.com/sourcegraph/sourcegraph/internal/grpc"
	"github.com/sourcegraph/sourcegraph/internal/grpc/defaults"
	"github.com/sourcegraph/sourcegraph/internal/hostname"
	"github.com/sourcegraph/sourcegraph/internal/httpcli"
	"github.com/sourcegraph/sourcegraph/internal/instrumentation"
	"github.com/sourcegraph/sourcegraph/internal/jsonc"
	"github.com/sourcegraph/sourcegraph/internal/observation"
	"github.com/sourcegraph/sourcegraph/internal/ratelimit"
	"github.com/sourcegraph/sourcegraph/internal/repos"
	"github.com/sourcegraph/sourcegraph/internal/requestclient"
	"github.com/sourcegraph/sourcegraph/internal/service"
	"github.com/sourcegraph/sourcegraph/internal/trace"
	"github.com/sourcegraph/sourcegraph/internal/types"
	"github.com/sourcegraph/sourcegraph/internal/wrexec"
	"github.com/sourcegraph/sourcegraph/lib/errors"
	"github.com/sourcegraph/sourcegraph/schema"
)

type EnterpriseInit func(db database.DB, keyring keyring.Ring)

func Main(ctx context.Context, observationCtx *observation.Context, ready service.ReadyFunc, config *Config, enterpriseInit EnterpriseInit) error {
	logger := observationCtx.Logger

	if err := config.Validate(); err != nil {
		return errors.Wrap(err, "failed to validate configuration")
	}

	// Ensure the ReposDir exists.
	if err := os.MkdirAll(config.ReposDir, os.ModePerm); err != nil {
		return errors.Wrap(err, "creating SRC_REPOS_DIR")
	}

	sqlDB, err := getDB(observationCtx)
	if err != nil {
		return errors.Wrap(err, "initializing database stores")
	}
	db := database.NewDB(observationCtx.Logger, sqlDB)

	repoStore := db.Repos()
	dependenciesSvc := dependencies.NewService(observationCtx, db)
	externalServiceStore := db.ExternalServices()

	err = keyring.Init(ctx)
	if err != nil {
		return errors.Wrap(err, "initializing keyring")
	}

	if enterpriseInit != nil {
		enterpriseInit(db, keyring.Default())
	}

	if err != nil {
		return errors.Wrap(err, "creating sub-repo client")
	}

	recordingCommandFactory := wrexec.NewRecordingCommandFactory(nil, 0)
	gitserver := server.Server{
		Logger:             logger,
		ObservationCtx:     observationCtx,
		ReposDir:           config.ReposDir,
		DesiredPercentFree: config.JanitorReposDesiredPercentFree,
		GetRemoteURLFunc: func(ctx context.Context, repo api.RepoName) (string, error) {
			return getRemoteURLFunc(ctx, db, repoStore, repo)
		},
		GetVCSSyncer: func(ctx context.Context, repo api.RepoName) (server.VCSSyncer, error) {
			return getVCSSyncer(ctx, &newVCSSyncerOpts{
				externalServiceStore:    externalServiceStore,
				repoStore:               repoStore,
				depsSvc:                 dependenciesSvc,
				repo:                    repo,
				reposDir:                config.ReposDir,
				coursierCacheDir:        config.CoursierCacheDir,
				recordingCommandFactory: recordingCommandFactory,
			})
		},
		Hostname:                externalAddress(),
		DB:                      db,
		CloneQueue:              server.NewCloneQueue(observationCtx, list.New()),
		GlobalBatchLogSemaphore: semaphore.NewWeighted(int64(config.BatchLogGlobalConcurrencyLimit)),
		Perforce:                perforce.NewService(ctx, observationCtx, logger, db, list.New()),
		RecordingCommandFactory: recordingCommandFactory,
		DeduplicatedForksSet:    types.NewRepoURICache(conf.GetDeduplicatedForksIndex()),
	}

	conf.Watch(func() {
		gitserver.DeduplicatedForksSet.Overwrite(conf.GetDeduplicatedForksIndex())

		// We update the factory with a predicate func. Each subsequent recordable command will use this predicate
		// to determine whether a command should be recorded or not.
		recordingConf := conf.Get().SiteConfig().GitRecorder
		if recordingConf == nil {
			recordingCommandFactory.Disable()
			return
		}
		recordingCommandFactory.Update(recordCommandsOnRepos(recordingConf.Repos, recordingConf.IgnoredGitCommands), recordingConf.Size)
	})

	configurationWatcher := conf.DefaultClient()

	var additionalServerOptions []grpc.ServerOption

	for method, scopedLogger := range map[string]log.Logger{
		proto.GitserverService_Exec_FullMethodName:      logger.Scoped("exec.accesslog", "exec endpoint access log"),
		proto.GitserverService_Archive_FullMethodName:   logger.Scoped("archive.accesslog", "archive endpoint access log"),
		proto.GitserverService_P4Exec_FullMethodName:    logger.Scoped("p4exec.accesslog", "p4-exec endpoint access log"),
		proto.GitserverService_GetObject_FullMethodName: logger.Scoped("get-object.accesslog", "get-object endpoint access log"),
	} {
		streamInterceptor := accesslog.StreamServerInterceptor(scopedLogger, configurationWatcher)
		unaryInterceptor := accesslog.UnaryServerInterceptor(scopedLogger, configurationWatcher)

		additionalServerOptions = append(additionalServerOptions,
			grpc.ChainStreamInterceptor(methodSpecificStreamInterceptor(method, streamInterceptor)),
			grpc.ChainUnaryInterceptor(methodSpecificUnaryInterceptor(method, unaryInterceptor)),
		)
	}

	grpcServer := defaults.NewServer(logger, additionalServerOptions...)

	proto.RegisterGitserverServiceServer(grpcServer, &server.GRPCServer{
		Server: &gitserver,
	})

	gitserver.RegisterMetrics(observationCtx, db)

	if tmpDir, err := gitserver.SetupAndClearTmp(); err != nil {
		return errors.Wrap(err, "failed to setup temporary directory")
	} else if err := os.Setenv("TMP_DIR", tmpDir); err != nil {
		// Additionally, set TMP_DIR so other temporary files we may accidentally
		// create are on the faster RepoDir mount.
		return errors.Wrap(err, "setting TMP_DIR")
	}

	// Create Handler now since it also initializes state
	// TODO: Why do we set server state as a side effect of creating our handler?
	handler := gitserver.Handler()
	handler = actor.HTTPMiddleware(logger, handler)
	handler = requestclient.InternalHTTPMiddleware(handler)
	handler = trace.HTTPMiddleware(logger, handler, conf.DefaultClient())
	handler = instrumentation.HTTPMiddleware("", handler)
	handler = internalgrpc.MultiplexHandlers(grpcServer, handler)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Best effort attempt to sync rate limiters for external services early on. If
	// it fails, we'll try again in the background sync below.
	if err := syncExternalServiceRateLimiters(ctx, externalServiceStore); err != nil {
		logger.Warn("error performing initial rate limit sync", log.Error(err))
	}

	// Ready immediately
	ready()

	go syncRateLimiters(ctx, logger, externalServiceStore, config.RateLimitSyncerLimitPerSecond)
	go gitserver.Janitor(actor.WithInternalActor(ctx), config.JanitorInterval)
	go gitserver.SyncRepoState(config.SyncRepoStateInterval, config.SyncRepoStateBatchSize, config.SyncRepoStateUpdatePerSecond)

	gitserver.StartClonePipeline(ctx)

	addr := getAddr()
	srv := &http.Server{
		Addr:    addr,
		Handler: handler,
	}
	logger.Info("git-server: listening", log.String("addr", srv.Addr))

	go func() {
		err := srv.ListenAndServe()
		if err != http.ErrServerClosed {
			logger.Fatal(err.Error())
		}
	}()

	// Listen for shutdown signals. When we receive one attempt to clean up,
	// but do an insta-shutdown if we receive more than one signal.
	c := make(chan os.Signal, 2)
	signal.Notify(c, syscall.SIGINT, syscall.SIGHUP, syscall.SIGTERM)

	// Once we receive one of the signals from above, continues with the shutdown
	// process.
	<-c
	go func() {
		// If a second signal is received, exit immediately.
		<-c
		os.Exit(0)
	}()

	// Wait for at most for the configured shutdown timeout.
	ctx, cancel = context.WithTimeout(ctx, goroutine.GracefulShutdownTimeout)
	defer cancel()
	// Stop accepting requests.
	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("shutting down http server", log.Error(err))
	}

	// The most important thing this does is kill all our clones. If we just
	// shutdown they will be orphaned and continue running.
	gitserver.Stop()

	return nil
}

func configureFusionClient(conn schema.PerforceConnection) server.FusionConfig {
	// Set up default settings first
	fc := server.FusionConfig{
		Enabled:             false,
		Client:              conn.P4Client,
		LookAhead:           2000,
		NetworkThreads:      12,
		NetworkThreadsFetch: 12,
		PrintBatch:          10,
		Refresh:             100,
		Retries:             10,
		MaxChanges:          -1,
		IncludeBinaries:     false,
		FsyncEnable:         false,
	}

	if conn.FusionClient == nil {
		return fc
	}

	// Required
	fc.Enabled = conn.FusionClient.Enabled
	fc.LookAhead = conn.FusionClient.LookAhead

	// Optional
	if conn.FusionClient.NetworkThreads > 0 {
		fc.NetworkThreads = conn.FusionClient.NetworkThreads
	}
	if conn.FusionClient.NetworkThreadsFetch > 0 {
		fc.NetworkThreadsFetch = conn.FusionClient.NetworkThreadsFetch
	}
	if conn.FusionClient.PrintBatch > 0 {
		fc.PrintBatch = conn.FusionClient.PrintBatch
	}
	if conn.FusionClient.Refresh > 0 {
		fc.Refresh = conn.FusionClient.Refresh
	}
	if conn.FusionClient.Retries > 0 {
		fc.Retries = conn.FusionClient.Retries
	}
	if conn.FusionClient.MaxChanges > 0 {
		fc.MaxChanges = conn.FusionClient.MaxChanges
	}
	fc.IncludeBinaries = conn.FusionClient.IncludeBinaries
	fc.FsyncEnable = conn.FusionClient.FsyncEnable

	return fc
}

// getDB initializes a connection to the database and returns a dbutil.DB
func getDB(observationCtx *observation.Context) (*sql.DB, error) {
	// Gitserver is an internal actor. We rely on the frontend to do authz checks for
	// user requests.
	//
	// This call to SetProviders is here so that calls to GetProviders don't block.
	authz.SetProviders(true, []authz.Provider{})

	dsn := conf.GetServiceConnectionValueAndRestartOnChange(func(serviceConnections conftypes.ServiceConnections) string {
		return serviceConnections.PostgresDSN
	})
	return connections.EnsureNewFrontendDB(observationCtx, dsn, "gitserver")
}

func getRemoteURLFunc(
	ctx context.Context,
	db database.DB,
	repoStore database.RepoStore,
	repo api.RepoName,
) (string, error) {
	r, err := repoStore.GetByName(ctx, repo)
	if err != nil {
		return "", err
	}

	for _, info := range r.Sources {
		// build the clone url using the external service config instead of using
		// the source CloneURL field
		svc, err := db.ExternalServices().GetByID(ctx, info.ExternalServiceID())
		if err != nil {
			return "", err
		}

		if svc.CloudDefault && r.Private {
			// We won't be able to use this remote URL, so we should skip it. This can happen
			// if a repo moves from being public to private while belonging to both a cloud
			// default external service and another external service with a token that has
			// access to the private repo.
			continue
		}

		return repos.EncryptableCloneURL(ctx, log.Scoped("repos.CloneURL", ""), db, svc.Kind, svc.Config, r)
	}
	return "", errors.Errorf("no sources for %q", repo)
}

type newVCSSyncerOpts struct {
	externalServiceStore    database.ExternalServiceStore
	repoStore               database.RepoStore
	depsSvc                 *dependencies.Service
	repo                    api.RepoName
	reposDir                string
	coursierCacheDir        string
	recordingCommandFactory *wrexec.RecordingCommandFactory
}

func getVCSSyncer(ctx context.Context, opts *newVCSSyncerOpts) (server.VCSSyncer, error) {
	// We need an internal actor in case we are trying to access a private repo. We
	// only need access in order to find out the type of code host we're using, so
	// it's safe.
	r, err := opts.repoStore.GetByName(actor.WithInternalActor(ctx), opts.repo)
	if err != nil {
		return nil, errors.Wrap(err, "get repository")
	}

	extractOptions := func(connection any) (string, error) {
		for _, info := range r.Sources {
			extSvc, err := opts.externalServiceStore.GetByID(ctx, info.ExternalServiceID())
			if err != nil {
				return "", errors.Wrap(err, "get external service")
			}
			rawConfig, err := extSvc.Config.Decrypt(ctx)
			if err != nil {
				return "", err
			}
			normalized, err := jsonc.Parse(rawConfig)
			if err != nil {
				return "", errors.Wrap(err, "normalize JSON")
			}
			if err = jsoniter.Unmarshal(normalized, connection); err != nil {
				return "", errors.Wrap(err, "unmarshal JSON")
			}
			return extSvc.URN(), nil
		}
		return "", errors.Errorf("unexpected empty Sources map in %v", r)
	}

	switch r.ExternalRepo.ServiceType {
	case extsvc.TypePerforce:
		var c schema.PerforceConnection
		if _, err := extractOptions(&c); err != nil {
			return nil, err
		}

		p4Home := filepath.Join(opts.reposDir, server.P4HomeName)
		// Ensure the directory exists
		if err := os.MkdirAll(p4Home, os.ModePerm); err != nil {
			return nil, errors.Wrapf(err, "ensuring p4Home exists: %q", p4Home)
		}

		return &server.PerforceDepotSyncer{
			MaxChanges:   int(c.MaxChanges),
			Client:       c.P4Client,
			FusionConfig: configureFusionClient(c),
			P4Home:       p4Home,
		}, nil
	case extsvc.TypeJVMPackages:
		var c schema.JVMPackagesConnection
		if _, err := extractOptions(&c); err != nil {
			return nil, err
		}
		return server.NewJVMPackagesSyncer(&c, opts.depsSvc, opts.coursierCacheDir), nil
	case extsvc.TypeNpmPackages:
		var c schema.NpmPackagesConnection
		urn, err := extractOptions(&c)
		if err != nil {
			return nil, err
		}
		cli, err := npm.NewHTTPClient(urn, c.Registry, c.Credentials, httpcli.ExternalClientFactory)
		if err != nil {
			return nil, err
		}
		return server.NewNpmPackagesSyncer(c, opts.depsSvc, cli), nil
	case extsvc.TypeGoModules:
		var c schema.GoModulesConnection
		urn, err := extractOptions(&c)
		if err != nil {
			return nil, err
		}
		cli := gomodproxy.NewClient(urn, c.Urls, httpcli.ExternalClientFactory)
		return server.NewGoModulesSyncer(&c, opts.depsSvc, cli), nil
	case extsvc.TypePythonPackages:
		var c schema.PythonPackagesConnection
		urn, err := extractOptions(&c)
		if err != nil {
			return nil, err
		}
		cli, err := pypi.NewClient(urn, c.Urls, httpcli.ExternalClientFactory)
		if err != nil {
			return nil, err
		}
		return server.NewPythonPackagesSyncer(&c, opts.depsSvc, cli, opts.reposDir), nil
	case extsvc.TypeRustPackages:
		var c schema.RustPackagesConnection
		urn, err := extractOptions(&c)
		if err != nil {
			return nil, err
		}
		cli, err := crates.NewClient(urn, httpcli.ExternalClientFactory)
		if err != nil {
			return nil, err
		}
		return server.NewRustPackagesSyncer(&c, opts.depsSvc, cli), nil
	case extsvc.TypeRubyPackages:
		var c schema.RubyPackagesConnection
		urn, err := extractOptions(&c)
		if err != nil {
			return nil, err
		}
		cli, err := rubygems.NewClient(urn, c.Repository, httpcli.ExternalClientFactory)
		if err != nil {
			return nil, err
		}
		return server.NewRubyPackagesSyncer(&c, opts.depsSvc, cli), nil
	}
	return server.NewGitRepoSyncer(opts.recordingCommandFactory), nil
}

func syncExternalServiceRateLimiters(ctx context.Context, store database.ExternalServiceStore) error {
	svcs, err := store.List(ctx, database.ExternalServicesListOptions{})
	if err != nil {
		return errors.Wrap(err, "listing external services")
	}
	syncer := repos.NewRateLimitSyncer(ratelimit.DefaultRegistry, store, repos.RateLimitSyncerOpts{})
	return syncer.SyncServices(ctx, svcs)
}

// Sync rate limiters from config. Since we don't have a trigger that watches for
// changes to rate limits we'll run this periodically in the background.
func syncRateLimiters(ctx context.Context, logger log.Logger, store database.ExternalServiceStore, perSecond int) {
	backoff := 5 * time.Second
	batchSize := 50
	logger = logger.Scoped("syncRateLimiters", "sync rate limiters from config")

	// perSecond should be spread across all gitserver instances and we want to wait
	// until we know about at least one instance.
	var instanceCount int
	for {
		instanceCount = len(conf.Get().ServiceConnectionConfig.GitServers)
		if instanceCount > 0 {
			break
		}

		logger.Warn("found zero gitserver instance, trying again after backoff", log.Duration("backoff", backoff))
	}

	limiter := ratelimit.NewInstrumentedLimiter("RateLimitSyncer", rate.NewLimiter(rate.Limit(float64(perSecond)/float64(instanceCount)), batchSize))
	syncer := repos.NewRateLimitSyncer(ratelimit.DefaultRegistry, store, repos.RateLimitSyncerOpts{
		PageSize: batchSize,
		Limiter:  limiter,
	})

	var lastSuccessfulSync time.Time
	ticker := time.NewTicker(1 * time.Minute)
	for {
		start := time.Now()
		if err := syncer.SyncLimitersSince(ctx, lastSuccessfulSync); err != nil {
			logger.Warn("syncRateLimiters: error syncing rate limits", log.Error(err))
		} else {
			lastSuccessfulSync = start
		}

		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}

// externalAddress calculates the name of this gitserver as it would appear in
// SRC_GIT_SERVERS.
//
// Note: we can't just rely on the listen address since more than likely
// gitserver is behind a k8s service.
func externalAddress() string {
	// First we check for it being explicitly set. This should only be
	// happening in environments were we run gitserver on localhost.
	if addr := os.Getenv("GITSERVER_EXTERNAL_ADDR"); addr != "" {
		return addr
	}
	// Otherwise we assume we can reach gitserver via its hostname / its
	// hostname is a prefix of the reachable address (see hostnameMatch).
	return hostname.Get()
}

func getAddr() string {
	addr := os.Getenv("GITSERVER_ADDR")
	if addr == "" {
		port := "3178"
		host := ""
		if env.InsecureDev {
			host = "127.0.0.1"
		}
		addr = net.JoinHostPort(host, port)
	}
	return addr
}

// methodSpecificStreamInterceptor returns a gRPC stream server interceptor that only calls the next interceptor if the method matches.
//
// The returned interceptor will call next if the invoked gRPC method matches the method parameter. Otherwise, it will call handler directly.
func methodSpecificStreamInterceptor(method string, next grpc.StreamServerInterceptor) grpc.StreamServerInterceptor {
	return func(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
		if method != info.FullMethod {
			return handler(srv, ss)
		}

		return next(srv, ss, info, handler)
	}
}

// methodSpecificUnaryInterceptor returns a gRPC unary server interceptor that only calls the next interceptor if the method matches.
//
// The returned interceptor will call next if the invoked gRPC method matches the method parameter. Otherwise, it will call handler directly.
func methodSpecificUnaryInterceptor(method string, next grpc.UnaryServerInterceptor) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp interface{}, err error) {
		if method != info.FullMethod {
			return handler(ctx, req)
		}

		return next(ctx, req, info, handler)
	}
}

var defaultIgnoredGitCommands = []string{
	"show",
	"rev-parse",
	"log",
	"diff",
	"ls-tree",
}

// recordCommandsOnRepos returns a ShouldRecordFunc which determines whether the given command should be recorded
// for a particular repository.
func recordCommandsOnRepos(repos []string, ignoredGitCommands []string) wrexec.ShouldRecordFunc {
	// empty repos, means we should never record since there is nothing to match on
	if len(repos) == 0 {
		return func(ctx context.Context, c *exec.Cmd) bool {
			return false
		}
	}

	if len(ignoredGitCommands) == 0 {
		ignoredGitCommands = append(ignoredGitCommands, defaultIgnoredGitCommands...)
	}

	// we won't record any git commands with these commands since they are considered to be not destructive
	ignoredGitCommandsMap := collections.NewSet(ignoredGitCommands...)

	return func(ctx context.Context, cmd *exec.Cmd) bool {
		base := filepath.Base(cmd.Path)
		if base != "git" {
			return false
		}

		repoMatch := false
		// If repos contains a single "*" element, it means to record commands
		// for all repositories.
		if len(repos) == 1 && repos[0] == "*" {
			repoMatch = true
		} else {
			for _, repo := range repos {
				// We need to check the suffix, because we can have some common parts in
				// different repo names. E.g. "sourcegraph/sourcegraph" and
				// "sourcegraph/sourcegraph-code-ownership" will both be allowed even if only the
				// first name is included in the config.
				if strings.HasSuffix(cmd.Dir, repo+"/.git") {
					repoMatch = true
					break
				}
			}
		}

		// If the repo doesn't match, no use in checking if it is a command we should record.
		if !repoMatch {
			return false
		}
		// we have to scan the Args, since it isn't guaranteed that the Arg at index 1 is the git command:
		// git -c "protocol.version=2" remote show
		for _, arg := range cmd.Args {
			if ok := ignoredGitCommandsMap.Has(arg); ok {
				return false
			}
		}
		return true
	}
}
