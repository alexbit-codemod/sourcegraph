package inventory

import (
	"archive/tar"
	"context"
	"github.com/sourcegraph/conc/iter"
	"io"
	"io/fs"
	"sort"

	"github.com/sourcegraph/sourcegraph/internal/gitserver"
	"github.com/sourcegraph/sourcegraph/lib/errors"
)

func (c *Context) All(ctx context.Context, gs gitserver.Client) (inv Inventory, err error) {
	r, err := gs.ArchiveReader(ctx, c.Repo, gitserver.ArchiveOptions{Treeish: "HEAD", Format: gitserver.ArchiveFormatTar})
	if err != nil {
		return Inventory{}, err
	}

	invs := make([]Inventory, 0)
	tr := c.NewTarReader(r)
	for {
		th, err := tr.Next()
		if err != nil {
			if errors.Is(err, io.EOF) {
				return Sum(invs), nil
			}
			return Inventory{}, err
		}
		entry := th.FileInfo()

		switch {
		case entry.Mode().IsRegular():
			inv, err := c.fileTar(ctx, th)
			if err != nil {
				return Inventory{}, err
			}
			invs = append(invs, inv)
		case entry.Mode().IsDir():
			// If we want to we could try to optimize cache invalidation at the tree level
			// here. For now, we only iterate over all the files in the archive.
			continue
		default:
			// Skip symlinks, submodules, etc.
			continue
		}
	}
}

// Entries computes the inventory of languages for the given entries. It traverses trees recursively
// and caches results for each subtree. Results for listed files are cached.
//
// If a file is referenced more than once (e.g., because it is a descendent of a subtree, and it is
// passed directly), it will be double-counted in the result.
func (c *Context) Entries(ctx context.Context, entries ...fs.FileInfo) (Inventory, error) {
	invs := make([]Inventory, len(entries))
	for i, entry := range entries {
		var f func(context.Context, fs.FileInfo) (Inventory, error)
		switch {
		case entry.Mode().IsRegular():
			f = c.file
		case entry.Mode().IsDir():
			f = c.tree
		default:
			// Skip symlinks, submodules, etc.
			continue
		}

		var err error
		invs[i], err = f(ctx, entry)
		if err != nil {
			return Inventory{}, err
		}
	}

	return Sum(invs), nil
}

func (c *Context) tree(ctx context.Context, tree fs.FileInfo) (inv Inventory, err error) {
	// Get and set from the cache.
	if c.CacheGet != nil {
		if inv, ok := c.CacheGet(ctx, tree); ok {
			return inv, nil // cache hit
		}
	}
	if c.CacheSet != nil {
		defer func() {
			if err == nil {
				c.CacheSet(ctx, tree, inv) // store in cache
			}
		}()
	}

	entries, err := c.ReadTree(ctx, tree.Name())
	if err != nil {
		return Inventory{}, err
	}

	inventories, err := iter.MapErr(entries, func(entry *fs.FileInfo) (Inventory, error) {
		e := *entry
		switch {
		case e.Mode().IsRegular(): // file
			// Don't individually cache files that we found during tree traversal. The hit rate for
			// those cache entries is likely to be much lower than cache entries for files whose
			// inventory was directly requested.
			lang, err := getLang(ctx, e, c.NewFileReader)
			return Inventory{Languages: []Lang{lang}}, err
		case e.Mode().IsDir(): // subtree
			subtreeInv, err := c.tree(ctx, e)
			return subtreeInv, err
		default:
			// Skip symlinks, submodules, etc.
			return Inventory{}, nil
		}
	})

	if err != nil {
		return Inventory{}, err
	}

	return Sum(inventories), nil
}

// file computes the inventory of a single file. It caches the result.
func (c *Context) file(ctx context.Context, file fs.FileInfo) (inv Inventory, err error) {
	// Get and set from the cache.
	if c.CacheGet != nil {
		if inv, ok := c.CacheGet(ctx, file); ok {
			return inv, nil // cache hit
		}
	}
	if c.CacheSet != nil {
		defer func() {
			if err == nil {
				c.CacheSet(ctx, file, inv) // store in cache
			}
		}()
	}

	lang, err := getLang(ctx, file, c.NewFileReader)
	if err != nil {
		return Inventory{}, errors.Wrapf(err, "inventory file %q", file.Name())
	}
	if lang == (Lang{}) {
		return Inventory{}, nil
	}
	return Inventory{Languages: []Lang{lang}}, nil
}

func (c *Context) fileTar(ctx context.Context, file *tar.Header) (inv Inventory, err error) {
	// Get and set from the cache.
	if c.CacheGet != nil {
		if inv, ok := c.CacheGet(ctx, file.FileInfo()); ok {
			return inv, nil // cache hit
		}
	}
	if c.CacheSet != nil {
		defer func() {
			if err == nil {
				c.CacheSet(ctx, file.FileInfo(), inv) // store in cache
			}
		}()
	}

	lang, err := getLang(ctx, file.FileInfo(), c.NewFileReader)
	if err != nil {
		return Inventory{}, errors.Wrapf(err, "inventory file %q", file.FileInfo().Name())
	}
	if lang == (Lang{}) {
		return Inventory{}, nil
	}
	return Inventory{Languages: []Lang{lang}}, nil
}

func Sum(invs []Inventory) Inventory {
	byLang := map[string]*Lang{}
	for _, inv := range invs {
		for _, lang := range inv.Languages {
			if lang.Name == "" {
				continue
			}
			x := byLang[lang.Name]
			if x == nil {
				x = &Lang{Name: lang.Name}
				byLang[lang.Name] = x
			}
			x.TotalBytes += lang.TotalBytes
			x.TotalLines += lang.TotalLines
		}
	}

	sum := Inventory{Languages: make([]Lang, 0, len(byLang))}
	for name := range byLang {
		stats := byLang[name]
		stats.Name = name
		sum.Languages = append(sum.Languages, *stats)
	}
	sort.Slice(sum.Languages, func(i, j int) bool {
		if sum.Languages[i].TotalLines != sum.Languages[j].TotalLines {
			// Sort by lines descending
			return sum.Languages[i].TotalLines > sum.Languages[j].TotalLines
		}
		// Lines are equal, fall back to bytes
		if sum.Languages[i].TotalBytes != sum.Languages[j].TotalBytes {
			// Sort by bytes descending
			return sum.Languages[i].TotalBytes > sum.Languages[j].TotalBytes
		}
		// Lines and bytes are equal, fall back to name ascending
		return sum.Languages[i].Name < sum.Languages[j].Name
	})
	return sum
}
