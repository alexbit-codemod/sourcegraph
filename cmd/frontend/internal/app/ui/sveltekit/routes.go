package sveltekit

// This file is automatically generated. Do not edit it directly.
// To regenerate this file, run 'bazel run //client/web-sveltekit:write_generated'.
import (
	"github.com/grafana/regexp"

	"github.com/sourcegraph/sourcegraph/cmd/frontend/internal/app/ui/sveltekit/tags"
)

type svelteKitRoute struct {
	// The SvelteKit route ID
	Id string
	// The regular expression pattern that matches the corresponding path
	Pattern *regexp.Regexp
	// The tags associated with the route
	Tag tags.Tag
}

var svelteKitRoutes = []svelteKitRoute{
	{
		Id:      "/[...repo=reporev]/(validrev)/(code)",
		Pattern: regexp.MustCompile("^/(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,})))(?:@(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,}))))?/?$"),
		Tag:     tags.EnableOptIn | tags.RepoRoot,
	},
	{
		Id:      "/[...repo=reporev]/(validrev)/(code)/-/blob/[...path]",
		Pattern: regexp.MustCompile("^/(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,})))(?:@(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,}))))?/-/blob(?:/.*)?/?$"),
		Tag:     tags.EnableOptIn,
	},
	{
		Id:      "/[...repo=reporev]/(validrev)/(code)/-/tree/[...path]",
		Pattern: regexp.MustCompile("^/(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,})))(?:@(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,}))))?/-/tree(?:/.*)?/?$"),
		Tag:     tags.EnableOptIn,
	},
	{
		Id:      "/[...repo=reporev]/(validrev)/-/branches",
		Pattern: regexp.MustCompile("^/(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,})))(?:@(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,}))))?/-/branches/?$"),
		Tag:     tags.EnableOptIn,
	},
	{
		Id:      "/[...repo=reporev]/(validrev)/-/branches/all",
		Pattern: regexp.MustCompile("^/(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,})))(?:@(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,}))))?/-/branches/all/?$"),
		Tag:     tags.EnableOptIn,
	},
	{
		Id:      "/[...repo=reporev]/(validrev)/-/commit/[...revspec]",
		Pattern: regexp.MustCompile("^/(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,})))(?:@(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,}))))?/-/commit(?:/.*)?/?$"),
		Tag:     tags.EnableOptIn,
	},
	{
		Id:      "/[...repo=reporev]/(validrev)/-/commits/[...path]",
		Pattern: regexp.MustCompile("^/(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,})))(?:@(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,}))))?/-/commits(?:/.*)?/?$"),
		Tag:     tags.EnableOptIn,
	},
	{
		Id:      "/[...repo=reporev]/(validrev)/-/stats/contributors",
		Pattern: regexp.MustCompile("^/(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,})))(?:@(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,}))))?/-/stats/contributors/?$"),
		Tag:     tags.EnableOptIn,
	},
	{
		Id:      "/[...repo=reporev]/(validrev)/-/tags",
		Pattern: regexp.MustCompile("^/(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,})))(?:@(?:(?:(?:[^@/-]|(?:[^/@]{2,}))/)*(?:[^@/-]|(?:[^/@]{2,}))))?/-/tags/?$"),
		Tag:     tags.EnableOptIn,
	},
	{
		Id:      "/search",
		Pattern: regexp.MustCompile("^/search/?$"),
		Tag:     tags.EnableOptIn | tags.EnableRollout,
	},
}
