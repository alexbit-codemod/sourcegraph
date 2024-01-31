// Package htmlutil provides common utils for working with user-generated HTML content,
// such as Markdown or Jupyter notebook conversions:
//
// - sanitization policy (bluemonday)
package htmlutil

import (
	"bytes"
	"io"
	"regexp"
	"sync"

	"github.com/microcosm-cc/bluemonday"
)

var (
	once sync.Once
	p    *bluemonday.Policy
)

// policy configures a standard HTML sanitization policy.
func policy() *bluemonday.Policy {
	once.Do(func() {
		p = bluemonday.UGCPolicy()
		p.AllowAttrs("name").Matching(bluemonday.SpaceSeparatedTokens).OnElements("a")
		p.AllowAttrs("rel").Matching(regexp.MustCompile(`^nofollow$`)).OnElements("a")
		p.AllowAttrs("class").Matching(regexp.MustCompile(`^anchor$`)).OnElements("a")
		p.AllowAttrs("aria-hidden").Matching(regexp.MustCompile(`^true$`)).OnElements("a")
		p.AllowAttrs("type").Matching(regexp.MustCompile(`^checkbox$`)).OnElements("input")
		p.AllowAttrs("checked", "disabled").Matching(regexp.MustCompile(`^$`)).OnElements("input")
		p.AllowAttrs("class").Matching(regexp.MustCompile(`^(?:chroma-[a-zA-Z0-9\-]+)|chroma$`)).OnElements("pre", "code", "span")
		p.AllowAttrs("align").OnElements("img", "p")
		p.AllowElements("picture", "video", "track", "source")
		p.AllowAttrs("srcset", "src", "type", "media", "width", "height", "sizes").OnElements("source")
		p.AllowAttrs("playsinline", "muted", "autoplay", "loop", "controls", "width", "height", "poster", "src").OnElements("video")
		p.AllowAttrs("src", "kind", "srclang", "default", "label").OnElements("track")
		p.AddTargetBlankToFullyQualifiedLinks(true)
	})
	return p
}

// Policy returns the standard sanitization policty that can be further extended.
func Policy() *bluemonday.Policy {
	cp := *policy() // copy to avoid modifying the original policy.
	return &cp
}

// Sanitize applies a standard sanitization policy to an HTML string.
func Sanitize(s string) string {
	return policy().Sanitize(s)
}

// SanitizeBytes applies a standard sanitization policy to raw HTML bytes.
func SanitizeBytes(b []byte) []byte {
	return policy().SanitizeBytes(b)
}

// SanitizeReader applies a standard sanitization policy to an HTML stream.
func SanitizeReader(r io.Reader) *bytes.Buffer {
	return policy().SanitizeReader(r)
}
