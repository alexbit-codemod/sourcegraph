	"sync/atomic"

				cli := gitserver.NewStrictMockGitserverServiceClient()
				cli.RepoDeleteFunc.SetDefaultHook(mockRepoDelete)
				return cli
		cli := gitserver.NewTestClient(t).
			WithDoer(httpcli.DoerFunc(func(r *http.Request) (*http.Response, error) {
			})).
			WithClientSource(source)
			cli := gitserver.NewStrictMockGitserverServiceClient()
			cli.BatchLogFunc.SetDefaultHook(mockBatchLog)
			return cli
	cli := gitserver.NewTestClient(t).WithClientSource(source)
			cli := gitserver.NewStrictMockGitserverServiceClient()
			cli.BatchLogFunc.SetDefaultHook(mockBatchLog)
			return cli
	cli := gitserver.NewTestClient(t).
		WithDoer(httpcli.DoerFunc(func(r *http.Request) (*http.Response, error) {
		})).
		WithClientSource(source)
					cli := gitserver.NewStrictMockGitserverServiceClient()
					cli.IsRepoCloneableFunc.SetDefaultHook(mockIsRepoCloneable)
					return cli
			client := gitserver.NewTestClient(t).WithClientSource(source)
					cli := gitserver.NewStrictMockGitserverServiceClient()
					cli.IsRepoCloneableFunc.SetDefaultHook(mockIsRepoCloneable)
					return cli
			client := gitserver.NewTestClient(t).
				WithDoer(httpcli.DoerFunc(func(r *http.Request) (*http.Response, error) {
				})).
				WithClientSource(source)
	expectedResponses := []protocol.SystemInfo{
		var called atomic.Bool
					called.Store(true)
				cli := gitserver.NewStrictMockGitserverServiceClient()
				cli.DiskInfoFunc.SetDefaultHook(mockDiskInfo)
				return cli
		client := gitserver.NewTestClient(t).WithClientSource(source)
		if !called.Load() {
				cli := gitserver.NewStrictMockGitserverServiceClient()
				cli.DiskInfoFunc.SetDefaultHook(mockDiskInfo)
				return cli
		client := gitserver.NewTestClient(t).
			WithDoer(httpcli.DoerFunc(func(r *http.Request) (*http.Response, error) {
			})).
			WithClientSource(source)
				cli := gitserver.NewStrictMockGitserverServiceClient()
				cli.DiskInfoFunc.SetDefaultHook(mockDiskInfo)
				return cli
		client := gitserver.NewTestClient(t).WithClientSource(source)
				cli := gitserver.NewStrictMockGitserverServiceClient()
				cli.DiskInfoFunc.SetDefaultHook(mockDiskInfo)
				return cli
		client := gitserver.NewTestClient(t).
			WithDoer(httpcli.DoerFunc(func(r *http.Request) (*http.Response, error) {
			})).
			WithClientSource(source)