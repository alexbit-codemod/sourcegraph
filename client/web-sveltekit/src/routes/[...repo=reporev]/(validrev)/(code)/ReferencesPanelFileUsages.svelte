<script lang="ts">
    import { SourcegraphURL } from '@sourcegraph/common'

    import CodeExcerpt from '$lib/CodeExcerpt.svelte'
    import { observeIntersection } from '$lib/intersection-observer'
    import { fetchFileRangeMatches } from '$lib/search/api/highlighting'

    import type { ReferencesPanel_Usage } from './ReferencesPanel.gql'

    export let repo: string
    export let path: string
    export let usages: ReferencesPanel_Usage[]

    // TODO: ideally, we'd store this state outside the component so it doesn't
    // flash every time it loads initially from the cache. However, this will
    // be much less a big deal once we have proper plaintext lines.
    let highlightedHTMLChunks: string[][] | undefined
    let visible = false
    $: if (visible) {
        fetchFileRangeMatches({
            result: {
                repository: repo,
                // FIXME: Assumes that all usages for a repo/path combo are at the same revision.
                commit: usages[0].usageRange!.revision,
                path: path,
            },
            ranges: usages.map(usage => ({
                startLine: usage.usageRange!.range.start.line,
                endLine: usage.usageRange!.range.end.line + 1,
            })),
        })
            .then(result => {
                highlightedHTMLChunks = result
            })
            .catch(err => console.error('Failed to fetch highlighted usages', err))
    }

    function hrefForUsage(usage: ReferencesPanel_Usage): string {
        const { repository, revision, path, range } = usage.usageRange!
        // TODO: only include revision if it exists
        return SourcegraphURL.from(`${repository}@${revision}/-/blob/${path}`)
            .setLineRange({
                line: range.start.line + 1,
                character: range.start.character + 1,
                endLine: range.end.line + 1,
                endCharacter: range.end.character + 1,
            })
            .toString()
    }

    $: usageExcerpts = usages.map((usage, index) => ({
        startLine: usage.usageRange!.range.start.line,
        matches: [
            {
                startLine: usage.usageRange!.range.start.line,
                startCharacter: usage.usageRange!.range.start.character,
                endLine: usage.usageRange!.range.end.line,
                endCharacter: usage.usageRange!.range.end.character,
            },
        ],
        plaintextLines: [usage.surroundingContent],
        highlightedHTMLRows: highlightedHTMLChunks?.[index],
        href: hrefForUsage(usage),
    }))
</script>

<aside use:observeIntersection on:intersecting={event => (visible = visible || event.detail)}>
    <div class="header">{repo} ⋅ {path}</div>
    <div>
        {#each usageExcerpts as excerpt}
            <a href={excerpt.href}>
                <CodeExcerpt
                    collapseWhitespace
                    startLine={excerpt.startLine}
                    plaintextLines={excerpt.plaintextLines}
                    matches={excerpt.matches}
                    highlightedHTMLRows={excerpt.highlightedHTMLRows}
                />
            </a>
        {/each}
    </div>
</aside>

<style lang="scss">
    .header {
        background-color: var(--secondary-4);
        padding: 0.125rem 0.5rem;
        border-bottom: 1px solid var(--border-color);
    }

    a {
        display: block;
        padding: 0.25rem 0.5rem;
        border-bottom: 1px solid var(--border-color);
    }
</style>
