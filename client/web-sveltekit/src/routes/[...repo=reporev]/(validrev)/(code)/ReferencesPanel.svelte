<script lang="ts" context="module">
    export interface ActiveOccurrence {
        documentInfo: DocumentInfo
        occurrence: Occurrence
    }

    export interface ReferencesContext {
        activeOccurrence?: ActiveOccurrence
        usageKindFilter?: SymbolUsageKind
        treeFilter?: TreeFilter
    }

    const referencesKey = {}
    export function getReferencesContext(): Writable<ReferencesContext> {
        return getContext(referencesKey)
    }

    export function setReferencesContext(ctx: Writable<ReferencesContext>) {
        setContext(referencesKey, ctx)
    }

    interface RepoTreeEntry {
        type: 'repo'
        name: string
        id: string
        entries: PathTreeEntry[]
    }

    interface PathTreeEntry {
        type: 'path'
        repo: string
        name: string
        id: string
    }

    type TreeEntry = RepoTreeEntry | PathTreeEntry

    interface PathGroup {
        path: string
        usages: ReferencesPanel_Usage[]
    }

    interface RepoGroup {
        repo: string
        pathGroups: PathGroup[]
    }

    function groupUsages(usages: ReferencesPanel_Usage[]): RepoGroup[] {
        const seenRepos: Record<string, { index: number; seenPaths: Record<string, number> }> = {}
        const repoGroups: RepoGroup[] = []

        for (const usage of usages) {
            const repo = usage.usageRange!.repository
            if (seenRepos[repo] === undefined) {
                seenRepos[repo] = { index: repoGroups.length, seenPaths: {} }
                repoGroups.push({ repo, pathGroups: [] })
            }

            const path = usage.usageRange!.path
            const seenPaths = seenRepos[repo].seenPaths
            const pathGroups = repoGroups[seenRepos[repo].index].pathGroups

            if (seenPaths[path] === undefined) {
                seenPaths[path] = pathGroups.length
                pathGroups.push({ path, usages: [] })
            }

            pathGroups[seenPaths[path]].usages.push(usage)
        }

        return repoGroups
    }

    function treeProviderForEntries(entries: TreeEntry[]): TreeProvider<TreeEntry> {
        return {
            getNodeID(entry) {
                return entry.id
            },
            getEntries(): TreeEntry[] {
                return entries
            },
            isExpandable(entry) {
                return entry.type === 'repo'
            },
            isSelectable() {
                return true
            },
            fetchChildren(entry) {
                if (entry.type === 'repo') {
                    return Promise.resolve(treeProviderForEntries(entry.entries))
                } else {
                    throw new Error('path nodes are not expandable')
                }
            },
        }
    }

    function generateOutlineTree(repoGroups: RepoGroup[]): TreeProvider<TreeEntry> {
        const repoEntries: RepoTreeEntry[] = repoGroups.map((repoGroup, repoGroupIndex) => ({
            type: 'repo',
            name: repoGroup.repo,
            id: `repo-${repoGroupIndex}`,
            entries: repoGroup.pathGroups.map((pathGroup, pathGroupIndex) => ({
                type: 'path',
                name: pathGroup.path,
                repo: repoGroup.repo,
                id: `path-${repoGroupIndex}-${pathGroupIndex}`,
            })),
        }))
        return treeProviderForEntries(repoEntries)
    }

    export function getUsagesStore(client: GraphQLClient, documentInfo: DocumentInfo, occurrence: Occurrence) {
        return infinityQuery({
            client,
            query: ReferencesPanel_Usages,
            variables: {
                repoName: documentInfo.repoName,
                revspec: documentInfo.commitID,
                filePath: documentInfo.filePath,
                rangeStart: occurrence.range.start,
                rangeEnd: occurrence.range.end,
                symbolComparator: occurrence.symbol
                    ? {
                          name: { equals: occurrence.symbol },
                          provenance: {
                              /* equals: TODO */
                          },
                      }
                    : null,
                first: 100,
                afterCursor: null,
            },
            nextVariables: previousResult => {
                if (previousResult?.data?.usagesForSymbol?.pageInfo?.hasNextPage) {
                    return {
                        afterCursor: previousResult.data.usagesForSymbol.pageInfo.endCursor,
                    }
                }
                return undefined
            },
            combine: (previousResult, nextResult) => {
                if (!nextResult?.data?.usagesForSymbol) {
                    return nextResult
                }
                const previousNodes = previousResult?.data?.usagesForSymbol?.nodes ?? []
                const nextNodes = nextResult?.data?.usagesForSymbol?.nodes ?? []
                return {
                    ...nextResult,
                    data: {
                        usagesForSymbol: {
                            ...nextResult.data?.usagesForSymbol,
                            nodes: [...previousNodes, ...nextNodes],
                        },
                    },
                }
            },
        })
    }

    function matchesUsageKind(usageKindFilter: SymbolUsageKind | undefined): (usage: ReferencesPanel_Usage) => boolean {
        return usage => usageKindFilter === undefined || usage.usageKind === usageKindFilter
    }

    interface TreeFilter {
        repository: string
        path?: string
    }
</script>

<script lang="ts">
    import { getContext, setContext } from 'svelte'
    import { writable, type Writable } from 'svelte/store'

    import { infinityQuery, type GraphQLClient, type InfinityQueryStore } from '$lib/graphql'
    import { SymbolUsageKind } from '$lib/graphql-types'
    import LoadingSpinner from '$lib/LoadingSpinner.svelte'
    import Scroller from '$lib/Scroller.svelte'
    import LoadingSkeleton from '$lib/search/dynamicFilters/LoadingSkeleton.svelte'
    import type { Occurrence } from '$lib/shared'
    import { createEmptySingleSelectTreeState, type TreeProvider } from '$lib/TreeView'
    import TreeView, { setTreeContext } from '$lib/TreeView.svelte'
    import type { DocumentInfo } from '$lib/web'
    import { Alert, PanelGroup } from '$lib/wildcard'
    import Panel from '$lib/wildcard/resizable-panel/Panel.svelte'
    import PanelResizeHandle from '$lib/wildcard/resizable-panel/PanelResizeHandle.svelte'

    import type {
        ReferencesPanel_Usage,
        ReferencesPanel_UsagesResult,
        ReferencesPanel_UsagesVariables,
    } from './ReferencesPanel.gql'
    import { ReferencesPanel_Usages } from './ReferencesPanel.gql'
    import ReferencesPanelFileUsages from './ReferencesPanelFileUsages.svelte'

    export let connection: InfinityQueryStore<ReferencesPanel_UsagesResult, ReferencesPanel_UsagesVariables> | undefined
    export let activeOccurrence: ActiveOccurrence | undefined
    export let usageKindFilter: SymbolUsageKind | undefined
    export let treeFilter: TreeFilter | undefined
    // TODO: actually use these filters

    export let setUsageKindFilter: (usageKind: SymbolUsageKind | undefined) => void
    export let setTreeFilter: (treeFilter: TreeFilter | undefined) => void

    const treeStateStore = writable({ ...createEmptySingleSelectTreeState(), disableScope: true })
    setTreeContext(treeStateStore)

    // TODO: it would be really nice if the tree API emitted select events with tree elements, not HTML elements
    function handleSelect(target: HTMLElement) {
        const selected = target.querySelector('[data-repo-name]') as HTMLElement
        const repository = selected.dataset.repoName ?? ''
        const path = selected.dataset.path
        if (treeFilter?.repository === repository && treeFilter?.path === path) {
            setTreeFilter(undefined)
            treeStateStore.update(old => ({ ...old, selected: '' }))
        } else {
            setTreeFilter({ repository, path })
            treeStateStore.update(old => ({ ...old, selected: selected.dataset.nodeId ?? '' }))
        }
    }

    $: loading = $connection?.fetching
    $: usages = $connection?.data?.usagesForSymbol?.nodes
    $: kindFilteredUsages = usages?.filter(matchesUsageKind(usageKindFilter))
    $: repoGroups = groupUsages(kindFilteredUsages ?? [])
    $: outlineTree = generateOutlineTree(repoGroups)
    $: displayGroups = repoGroups
        .flatMap(repoGroup => repoGroup.pathGroups.map(pathGroup => ({ repo: repoGroup.repo, ...pathGroup })))
        .filter(displayGroup => {
            if (treeFilter === undefined) {
                return true
            } else if (treeFilter.repository !== displayGroup.repo) {
                return false
            }
            return treeFilter.path === undefined || treeFilter.path === displayGroup.path
        })
</script>

{#if activeOccurrence === undefined}
    <!-- TODO: style this -->
    <div><p>Select a symbol in the code panel to view references.</p></div>
{:else}
    <PanelGroup id="references">
        <Panel id="references-sidebar" defaultSize={0.25} minSize={20} maxSize={60}>
            <div class="sidebar">
                <div role="radiogroup" aria-label="Select usage kind">
                    {#each Object.values(SymbolUsageKind) as usageKind}
                        {@const checked = usageKind === usageKindFilter}
                        <button
                            role="radio"
                            aria-checked={checked}
                            on:click={() => setUsageKindFilter(checked ? undefined : usageKind)}
                        >
                            {usageKind.toLowerCase()}s
                        </button>
                    {/each}
                </div>
                <div class="outline">
                    <TreeView treeProvider={outlineTree} on:select={event => handleSelect(event.detail)}>
                        <svelte:fragment let:entry>
                            {#if entry.type === 'repo'}
                                <span class="repo-entry" data-node-id={entry.id} data-repo-name={entry.name}
                                    >{entry.name}</span
                                >
                            {:else}
                                <span
                                    class="path-entry"
                                    data-node-id={entry.id}
                                    data-repo-name={entry.repo}
                                    data-path={entry.name}>{entry.name}</span
                                >
                            {/if}
                        </svelte:fragment>
                        <Alert slot="error" let:error variant="danger">
                            TODO: {error.message}
                        </Alert>
                    </TreeView>
                </div>
            </div>
        </Panel>
        <PanelResizeHandle />
        <Panel id="references-content">
            {#if usages}
                <Scroller margin={600} on:more={() => connection?.fetchMore()}>
                    <ul>
                        {#each displayGroups as pathGroup}
                            <li>
                                <ReferencesPanelFileUsages {...pathGroup} />
                            </li>
                        {/each}
                    </ul>
                    {#if loading}
                        <LoadingSpinner center />
                    {/if}
                </Scroller>
            {:else if loading}
                <LoadingSkeleton />
            {/if}
        </Panel>
    </PanelGroup>
{/if}

<style lang="scss">
    .sidebar {
        height: 100%;
        overflow-y: auto;
    }

    [role='radiogroup'] {
        display: flex;
        flex-direction: column;
        border-bottom: 1px solid var(--border-color);
        padding: 0.25rem 0;

        button[role='radio'] {
            all: unset;
            text-transform: capitalize;
            padding: 0.375rem 0.75rem;
            cursor: pointer;
            --icon-color: none;
            &[aria-checked='true'] {
                background-color: var(--primary);
                color: var(--body-bg);
            }
            &:not([aria-checked='true']):hover {
                background-color: var(--secondary-4);
            }
        }
    }

    :global([data-treeitem]) > :global([data-treeitem-label]) {
        cursor: pointer;

        &:hover {
            background-color: var(--secondary-4);
        }
    }

    :global([data-treeitem][aria-selected='true']) > :global([data-treeitem-label]) {
        --tree-node-expand-icon-color: var(--body-bg);
        --file-icon-color: var(--body-bg);
        --tree-node-label-color: var(--body-bg);

        background-color: var(--primary);
        &:hover {
            background-color: var(--primary);
        }
    }

    .repo-entry {
        font-size: var(--font-size-base);
    }
    .path-entry {
        font-size: var(--font-size-small);
    }

    ul {
        all: unset;
        li {
            all: unset;
        }
    }
</style>
