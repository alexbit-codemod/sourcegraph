package graphql

import (
	"context"

	"github.com/sourcegraph/scip/bindings/go/scip"

	"github.com/sourcegraph/sourcegraph/internal/api"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/codenav"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/codenav/shared"
	"github.com/sourcegraph/sourcegraph/internal/codeintel/core"
	resolverstubs "github.com/sourcegraph/sourcegraph/internal/codeintel/resolvers"
	"github.com/sourcegraph/sourcegraph/internal/types"
)

type usageConnectionResolver struct {
	nodes    []resolverstubs.UsageResolver
	pageInfo resolverstubs.PageInfo
}

var _ resolverstubs.UsageConnectionResolver = &usageConnectionResolver{}

func (u *usageConnectionResolver) Nodes(ctx context.Context) ([]resolverstubs.UsageResolver, error) {
	return u.nodes, nil
}

func (u *usageConnectionResolver) PageInfo() resolverstubs.PageInfo {
	return u.pageInfo
}

type usageResolver struct {
	symbol      *symbolInformationResolver
	provenance  resolverstubs.CodeGraphDataProvenance
	kind        resolverstubs.SymbolUsageKind
	linesGetter LinesGetter
	usageRange  *usageRangeResolver
}

var _ resolverstubs.UsageResolver = &usageResolver{}

func NewSyntacticUsageResolver(usage codenav.SyntacticMatch, repository types.Repo, revision api.CommitID, linesGetter LinesGetter) resolverstubs.UsageResolver {
	var kind resolverstubs.SymbolUsageKind
	if usage.IsDefinition {
		kind = resolverstubs.UsageKindDefinition
	} else {
		kind = resolverstubs.UsageKindReference
	}
	return &usageResolver{
		symbol: &symbolInformationResolver{
			name: usage.Symbol,
		},
		provenance:  resolverstubs.ProvenanceSyntactic,
		kind:        kind,
		linesGetter: linesGetter,
		usageRange: &usageRangeResolver{
			repository: repository,
			revision:   revision,
			path:       usage.Path,
			range_:     usage.Range,
		},
	}
}
func NewSearchBasedUsageResolver(usage codenav.SearchBasedMatch, repository types.Repo, revision api.CommitID, linesGetter LinesGetter) resolverstubs.UsageResolver {
	var kind resolverstubs.SymbolUsageKind
	if usage.IsDefinition {
		kind = resolverstubs.UsageKindDefinition
	} else {
		kind = resolverstubs.UsageKindReference
	}
	return &usageResolver{
		symbol:      nil,
		provenance:  resolverstubs.ProvenanceSearchBased,
		kind:        kind,
		linesGetter: linesGetter,
		usageRange: &usageRangeResolver{
			repository: repository,
			revision:   revision,
			path:       usage.Path,
			range_:     usage.Range,
		},
	}
}

func (u *usageResolver) Symbol(ctx context.Context) (resolverstubs.SymbolInformationResolver, error) {
	if u.symbol == nil {
		// NOTE: if I try to directly return u.symbol, I get a panic in the resolver.
		return nil, nil
	}
	return u.symbol, nil
}

func (u *usageResolver) Provenance(ctx context.Context) (resolverstubs.CodeGraphDataProvenance, error) {
	return u.provenance, nil
}

func (u *usageResolver) DataSource() *string {
	//TODO implement me
	// NOTE: For search-based usages it would be good to return if this usage was found via Zoekt or Searcher
	panic("implement me")
}

func (u *usageResolver) UsageRange(ctx context.Context) (resolverstubs.UsageRangeResolver, error) {
	return u.usageRange, nil
}

func (u *usageResolver) SurroundingContent(ctx context.Context, args *struct {
	*resolverstubs.SurroundingLines `json:"surroundingLines"`
}) (string, error) {
	lines, err := u.linesGetter.Get(
		ctx,
		u.usageRange.repository.Name,
		u.usageRange.revision,
		u.usageRange.path.RawValue(),
		int(u.usageRange.range_.Start.Line-*args.LinesBefore),
		int(u.usageRange.range_.End.Line+*args.LinesAfter+1),
	)
	if err != nil {
		return "", err
	}
	return string(lines), nil
}

func (u *usageResolver) UsageKind() resolverstubs.SymbolUsageKind {
	return u.kind
}

type symbolInformationResolver struct {
	name string
}

var _ resolverstubs.SymbolInformationResolver = &symbolInformationResolver{}

func (s *symbolInformationResolver) Name() (string, error) {
	return s.name, nil
}

func (s *symbolInformationResolver) Documentation() (*[]string, error) {
	//TODO implement me
	panic("implement me")
}

type usageRangeResolver struct {
	repository types.Repo
	revision   api.CommitID
	path       core.RepoRelPath
	range_     scip.Range
}

var _ resolverstubs.UsageRangeResolver = &usageRangeResolver{}

func (u *usageRangeResolver) Repository() string {
	return string(u.repository.Name)
}

func (u *usageRangeResolver) Revision() string {
	return string(u.revision)
}

func (u *usageRangeResolver) Path() string {
	return u.path.RawValue()
}

func (u *usageRangeResolver) Range() resolverstubs.RangeResolver {
	return &rangeResolver{
		lspRange: convertRange(shared.TranslateRange(u.range_)),
	}
}
