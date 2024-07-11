package codenav

import (
	"context"
	"sync"

	"github.com/sourcegraph/scip/bindings/go/scip"

	"github.com/sourcegraph/sourcegraph/internal/api"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/codenav/internal/lsifstore"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/codenav/shared"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/core"
	"github.com/sourcegraph/sourcegraph/internal/gitserver"
	"github.com/sourcegraph/sourcegraph/internal/types"
)

type Mapped interface {
	IndexCommit() api.CommitID
	TargetCommit() api.CommitID
}

type MappedIndex interface {
	GetDocument(context.Context, core.RepoRelPath) (MappedDocument, error)
	GetUploadSummary() core.UploadSummary
	// TODO: Should there be a bulk-API for getting multiple documents?
	Mapped
}

var _ MappedIndex = mappedIndex{}

type MappedDocument interface {
	GetOccurrences(context.Context) ([]*scip.Occurrence, error)
	GetOccurrencesAtRange(context.Context, scip.Range) ([]*scip.Occurrence, error)
	Mapped
}

var _ MappedDocument = &mappedDocument{}

// NewMappedIndex creates a MappedIndex for a completedUpload and a targetCommit
// All documents and occurrences in the index are mapped to the given targetCommit
func NewMappedIndex(
	lsifStore lsifstore.LsifStore,
	repo *types.Repo,
	gitserverClient gitserver.Client,
	upload core.UploadLike,
	targetCommit api.CommitID,
) (MappedIndex, error) {
	hunkCache, err := NewHunkCache(10)
	if err != nil {
		return nil, err
	}
	gitTreeTranslator := NewGitTreeTranslator(gitserverClient, &TranslationBase{
		Repo:   repo,
		Commit: upload.GetCommit(),
	}, hunkCache)
	return mappedIndex{
		lsifStore:         lsifStore,
		gitTreeTranslator: gitTreeTranslator,
		upload:            upload,
		targetCommit:      targetCommit,
	}, nil
}

type mappedIndex struct {
	lsifStore         lsifstore.LsifStore
	gitTreeTranslator GitTreeTranslator
	upload            core.UploadLike
	targetCommit      api.CommitID
}

func (i mappedIndex) IndexCommit() api.CommitID {
	return i.upload.GetCommit()
}

func (i mappedIndex) TargetCommit() api.CommitID {
	return i.targetCommit
}

func (i mappedIndex) GetUploadSummary() core.UploadSummary {
	return core.UploadSummary{
		ID:     i.upload.GetID(),
		Root:   i.upload.GetRoot(),
		Commit: i.upload.GetCommit(),
	}
}

func (i mappedIndex) GetDocument(ctx context.Context, path core.RepoRelPath) (MappedDocument, error) {
	// TODO: Treat document not found different from other errors
	document, err := i.lsifStore.SCIPDocument(ctx, i.upload.GetID(), core.NewUploadRelPath(i.upload, path))
	if err != nil {
		return nil, err
	}
	// TODO: Should we cache the mapped document? The current usages don't request the same document twice
	// so we'd just be increasing resident memory
	return &mappedDocument{
		gitTreeTranslator: i.gitTreeTranslator,
		indexCommit:       i.upload.GetCommit(),
		targetCommit:      i.targetCommit,
		path:              path,
		document:          document,
	}, nil
}

type mappedDocument struct {
	gitTreeTranslator GitTreeTranslator
	indexCommit       api.CommitID
	targetCommit      api.CommitID
	path              core.RepoRelPath
	document          *scip.Document

	isMappedLock sync.Mutex
	mapped       bool
}

func (d *mappedDocument) IndexCommit() api.CommitID {
	return d.indexCommit
}

func (d *mappedDocument) TargetCommit() api.CommitID {
	return d.targetCommit
}

func (d *mappedDocument) GetOccurrences(ctx context.Context) ([]*scip.Occurrence, error) {
	d.isMappedLock.Lock()
	defer d.isMappedLock.Unlock()
	if d.mapped {
		return d.document.Occurrences, nil
	}

	for _, occ := range d.document.Occurrences {
		scipRange := scip.NewRangeUnchecked(occ.Range)
		sharedRange := shared.TranslateRange(scipRange)
		mappedRange, ok, err := d.gitTreeTranslator.GetTargetCommitRangeFromSourceRange(ctx, string(d.targetCommit), d.path.RawValue(), sharedRange, false)
		if err != nil {
			return nil, err
		}
		if !ok {
			continue
		}
		occ.Range = mappedRange.ToSCIPRange().SCIPRange()
	}
	d.mapped = true
	return d.document.Occurrences, nil
}

func (d *mappedDocument) GetOccurrencesAtRange(ctx context.Context, rg scip.Range) ([]*scip.Occurrence, error) {
	// TODO: If we haven't mapped the entire document yet, it might be more efficient to map the search range
	// and filter the non-mapped occurrences. This would require locking access to the document with a Mutex as well.
	mappedOccurrences, err := d.GetOccurrences(ctx)
	if err != nil {
		return nil, err
	}
	return FindOccurrencesWithEqualRange(mappedOccurrences, rg), nil
}
