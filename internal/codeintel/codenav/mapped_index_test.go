package codenav

import (
	"context"
	"errors"
	"slices"
	"testing"

	"github.com/sourcegraph/scip/bindings/go/scip"
	"github.com/stretchr/testify/require"

	"github.com/sourcegraph/sourcegraph/internal/api"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/codenav/internal/lsifstore"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/codenav/shared"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/core"
	uploadsshared "github.com/sourcegraph/sourcegraph/internal/codeintel/uploads/shared"
)

var uploadIDSupply = 0

func newUploadID() int {
	uploadIDSupply += 1
	return uploadIDSupply
}

func ran(r int) scip.Range {
	return scip.NewRangeUnchecked([]int32{int32(r), int32(r), int32(r)})
}

type fakeOccurrence struct {
	symbol       string
	isDefinition bool
	rg           scip.Range
}

type fakeDocument struct {
	path        core.UploadRelPath
	occurrences []fakeOccurrence
}

func (d fakeDocument) Occurrences() []*scip.Occurrence {
	occs := make([]*scip.Occurrence, 0, len(d.occurrences))
	for _, occ := range d.occurrences {
		var symbolRoles scip.SymbolRole = 0
		if occ.isDefinition {
			symbolRoles = scip.SymbolRole_Definition
		}
		occs = append(occs, &scip.Occurrence{
			Range:       occ.rg.SCIPRange(),
			Symbol:      occ.symbol,
			SymbolRoles: int32(symbolRoles),
		})
	}
	return occs
}

func ref(symbol string, rg int) fakeOccurrence {
	return fakeOccurrence{
		symbol:       symbol,
		isDefinition: false,
		rg:           ran(rg),
	}
}

func def(symbol string, rg int) fakeOccurrence {
	return fakeOccurrence{
		symbol:       symbol,
		isDefinition: true,
		rg:           ran(rg),
	}
}

func doc(path string, occurrences ...fakeOccurrence) fakeDocument {
	return fakeDocument{
		path:        core.NewUploadRelPathUnchecked(path),
		occurrences: occurrences,
	}
}

// Set up uploads + lsifstore
func setupUpload(commit api.CommitID, root string, documents ...fakeDocument) (uploadsshared.CompletedUpload, lsifstore.LsifStore) {
	id := newUploadID()
	lsifStore := NewMockLsifStore()
	lsifStore.SCIPDocumentFunc.SetDefaultHook(func(ctx context.Context, uploadId int, path core.UploadRelPath) (*scip.Document, error) {
		if id != uploadId {
			return nil, errors.New("unknown upload id")
		}
		for _, document := range documents {
			if document.path.Equal(path) {
				return &scip.Document{
					RelativePath: document.path.RawValue(),
					Occurrences:  document.Occurrences(),
				}, nil
			}
		}
		return nil, errors.New("unknown path")
	})

	return uploadsshared.CompletedUpload{
		ID:     id,
		Commit: string(commit),
		Root:   root,
	}, lsifStore
}

func shiftSCIPRange(r scip.Range, numLines int) scip.Range {
	return scip.NewRangeUnchecked([]int32{
		r.Start.Line + int32(numLines),
		r.Start.Character,
		r.End.Line + int32(numLines),
		r.End.Character,
	})
}

func shiftPos(pos shared.Position, numLines int) shared.Position {
	return shared.Position{
		Line:      pos.Line + numLines,
		Character: pos.Character,
	}
}

// A GitTreeTranslator that returns positions and ranges shifted by numLines
// and returns failed translations for paths in newFiles
func fakeTranslator(indexCommit api.CommitID, numLines int, newFiles ...string) GitTreeTranslator {
	translator := NewMockGitTreeTranslator()
	translator.GetSourceCommitFunc.SetDefaultReturn(indexCommit)
	translator.GetTargetCommitPositionFromSourcePositionFunc.SetDefaultHook(func(ctx context.Context, commit string, path string, pos shared.Position, _ bool) (shared.Position, bool, error) {
		if slices.Contains(newFiles, path) {
			return shared.Position{}, false, nil
		}
		return shiftPos(pos, numLines), true, nil
	})
	translator.GetTargetCommitRangeFromSourceRangeFunc.SetDefaultHook(func(ctx context.Context, commit string, path string, rg shared.Range, _ bool) (shared.Range, bool, error) {
		if slices.Contains(newFiles, path) {
			return shared.Range{}, false, nil
		}
		return shared.Range{Start: shiftPos(rg.Start, numLines), End: shiftPos(rg.End, numLines)}, true, nil
	})
	return translator
}

// A GitTreeTranslator that returns all positions and ranges shifted by numLines.
func shiftAllTranslator(indexCommit api.CommitID, numLines int) GitTreeTranslator {
	return fakeTranslator(indexCommit, numLines)
}

// A GitTreeTranslator that returns all positions and ranges unchanged
func noopTranslator(indexCommit api.CommitID) GitTreeTranslator {
	return shiftAllTranslator(indexCommit, 0)
}

func TestNewMappedIndex(t *testing.T) {
	indexCommit := api.CommitID("deadbeef")
	targetCommit := api.CommitID("beefdead")
	upload, lsifStore := setupUpload(indexCommit, "")
	mappedIndex, err := NewMappedIndex(lsifStore, nil, nil, upload, targetCommit)
	require.NoError(t, err)

	require.Equal(t, indexCommit, mappedIndex.IndexCommit())
	require.Equal(t, targetCommit, mappedIndex.TargetCommit())
}

func setupSingleFileUpload() (api.CommitID, api.CommitID, uploadsshared.CompletedUpload, lsifstore.LsifStore) {
	indexCommit := api.CommitID("deadbeef")
	targetCommit := api.CommitID("beefdead")
	upload, lsifStore := setupUpload(indexCommit, "indexRoot/", doc("a.go",
		ref("a", 1),
		ref("b", 2),
		ref("c", 3)))
	return indexCommit, targetCommit, upload, lsifStore
}

func TestNewMappedIndex_GetDocumentNoTranslation(t *testing.T) {
	indexCommit, targetCommit, upload, lsifStore := setupSingleFileUpload()
	mappedIndex := mappedIndex{
		lsifStore,
		noopTranslator(indexCommit),
		upload,
		targetCommit}

	ctx := context.Background()

	_, err := mappedIndex.GetDocument(ctx, core.NewRepoRelPathUnchecked("indexRoot/unknown.go"))
	require.Error(t, err)

	mappedDocument, err := mappedIndex.GetDocument(ctx, core.NewRepoRelPathUnchecked("indexRoot/a.go"))
	require.NoError(t, err)

	allOccurrences, err := mappedDocument.GetOccurrences(ctx)
	require.NoError(t, err)
	require.Len(t, allOccurrences, 3)

	occurrences, err := mappedDocument.GetOccurrencesAtRange(ctx, ran(1))
	require.NoError(t, err)
	require.Len(t, occurrences, 1)
	require.Equal(t, scip.NewRangeUnchecked(occurrences[0].GetRange()).Start.Line, int32(1))

	noOccurrences, err := mappedDocument.GetOccurrencesAtRange(ctx, ran(4))
	require.NoError(t, err)
	require.Len(t, noOccurrences, 0)
}

func TestNewMappedIndex_GetDocumentWithTranslation(t *testing.T) {
	indexCommit, targetCommit, upload, lsifStore := setupSingleFileUpload()
	translator := shiftAllTranslator(indexCommit, 2)
	mappedIndex := mappedIndex{
		lsifStore,
		translator,
		upload,
		targetCommit}

	ctx := context.Background()
	mappedDocument, err := mappedIndex.GetDocument(ctx, core.NewRepoRelPathUnchecked("indexRoot/a.go"))
	require.NoError(t, err)

	allOccurrences, err := mappedDocument.GetOccurrences(ctx)
	require.NoError(t, err)
	require.Len(t, allOccurrences, 3)

	noOccurrences, err := mappedDocument.GetOccurrencesAtRange(ctx, ran(1))
	require.NoError(t, err)
	require.Len(t, noOccurrences, 0)

	occurrences, err := mappedDocument.GetOccurrencesAtRange(ctx, shiftSCIPRange(ran(1), 2))
	require.NoError(t, err)
	require.Len(t, occurrences, 1)
	require.Equal(t, scip.NewRangeUnchecked(occurrences[0].GetRange()).Start.Line, int32(3))
}
