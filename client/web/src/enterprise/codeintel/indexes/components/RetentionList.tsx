import { type FunctionComponent, useCallback } from 'react'

import { useApolloClient } from '@apollo/client'
import { mdiCheck, mdiClose, mdiMapSearch } from '@mdi/js'
import { useTranslation } from 'react-i18next'
import type { Observable } from 'rxjs'

import { isErrorLike } from '@sourcegraph/common'
import { displayRepoName, splitPath } from '@sourcegraph/shared/src/components/RepoLink'
import { H3, Icon, Link, Text } from '@sourcegraph/wildcard'

import {
    type Connection,
    FilteredConnection,
    type FilteredConnectionQueryArguments,
} from '../../../../components/FilteredConnection'
import type { PreciseIndexFields } from '../../../../graphql-operations'
import {
    type NormalizedUploadRetentionMatch,
    queryPreciseIndexRetention as defaultQueryPreciseIndexRetention,
} from '../hooks/queryPreciseIndexRetention'

export interface RetentionListProps {
    index: PreciseIndexFields
    queryPreciseIndexRetention?: typeof defaultQueryPreciseIndexRetention
}

const NumReferencesToShow = 5

export const RetentionList: FunctionComponent<RetentionListProps> = ({
    index,
    queryPreciseIndexRetention = defaultQueryPreciseIndexRetention,
}) => {
    const apolloClient = useApolloClient()

    const queryRetentionPoliciesCallback = useCallback(
        (args: FilteredConnectionQueryArguments): Observable<Connection<NormalizedUploadRetentionMatch>> => {
            if (index && !isErrorLike(index)) {
                return queryPreciseIndexRetention(apolloClient, index.id, {
                    matchesOnly: false,
                    numReferences: NumReferencesToShow,
                    ...args,
                })
            }

            throw new Error('unreachable: queryRetentionPolicies referenced with invalid upload')
        },
        [index, apolloClient, queryPreciseIndexRetention]
    )

    return (
        <FilteredConnection
            listComponent="table"
            headComponent={() => {
                const { t } = useTranslation('enterprise/codeintel/indexes/components')

                return (
                    <thead>
                        <tr>
                            <th className="border-top-0">{t('policy')}</th>
                            <th className="border-top-0 text-center">{t('matches')}</th>
                        </tr>
                    </thead>
                )
            }}
            listClassName="table mb-3 bt-0"
            noun="policy"
            pluralNoun="policies"
            nodeComponent={RetentionMatchNode}
            queryConnection={queryRetentionPoliciesCallback}
            cursorPaging={true}
            useURLQuery={false}
            hideSearch={true}
            emptyElement={<EmptyUploadRetentionMatchStatus />}
        />
    )
}

interface RetentionMatchNodeProps {
    node: NormalizedUploadRetentionMatch
}

const RetentionMatchNode: FunctionComponent<RetentionMatchNodeProps> = ({ node }) => {
    const { t } = useTranslation('enterprise/codeintel/indexes/components')

    return (
        <tr>
            <td>
                {node.matchType === 'UploadReference' ? (
                    <div>
                        <H3 className="m-0 d-block d-md-inline">
                            {t('referenced-by')}
                            {node.total}
                            {t('other-indexes', { nodeTotal: node.total })}
                        </H3>

                        <small className="d-block">
                            {t('indexes-dependencies')}
                            <br />
                            {t('referenced-by-index')}
                            <ReferenceList
                                items={node.uploadSlice.map<React.ReactNode>(upload => {
                                    const [repoBase, repoName] = splitPath(
                                        displayRepoName(upload.projectRoot?.repository.name || '')
                                    )
                                    return (
                                        <Link key={upload.id} to={`/site-admin/code-graph/indexes/${upload.id}`}>
                                            {repoBase}/{repoName}@{upload.inputCommit.slice(0, 7)}
                                        </Link>
                                    )
                                })}
                                totalCount={node.total}
                            />
                            .
                        </small>
                    </div>
                ) : (
                    <>
                        {node.configurationPolicy ? (
                            <Link to={`../configuration/${node.configurationPolicy.id}`} className="p-0">
                                <H3 className="m-0 d-block d-md-inline">{node.configurationPolicy.name}</H3>
                            </Link>
                        ) : (
                            <>
                                <H3 className="m-0 d-block d-md-inline">
                                    {t('tip-of-default-branch-retention-policy')}
                                </H3>

                                <small className="d-block">{t('upload-query-tip-default-branch')}</small>
                            </>
                        )}
                    </>
                )}
            </td>

            <td className="text-center">
                {node.matchType === 'UploadReference' || node.matches ? (
                    <Icon aria-hidden={true} className="text-success" svgPath={mdiCheck} />
                ) : (
                    <Icon aria-hidden={true} className="text-danger" svgPath={mdiClose} />
                )}
            </td>
        </tr>
    )
}

interface ReferenceListProps {
    items: React.ReactNode[]
    totalCount: number
}

const ReferenceList: FunctionComponent<ReferenceListProps> = ({ items, totalCount }) => {
    const { t } = useTranslation('enterprise/codeintel/indexes/components')

    const extraCount = totalCount - items.length
    if (extraCount > 0) {
        if (extraCount === 1) {
            items = [...items, <>{t('one-other')}</>]
        } else {
            items = [...items, <>{t('extra-others', { extraCount })}</>]
        }
    }

    return items.length === 0 ? (
        <></>
    ) : items.length === 1 ? (
        <>{items[0]}</>
    ) : items.length === 2 ? (
        <>
            {items[0]}
            {t('and')}
            {items[1]}
        </>
    ) : (
        <>
            {[
                ...items.slice(0, -1),
                <>
                    {t('and-space')}
                    {items.at(-1)}
                </>,
            ].map((item, index) => (
                <>
                    {index !== 0 && <>, </>}
                    {item}
                </>
            ))}
        </>
    )
}

const EmptyUploadRetentionMatchStatus: React.FunctionComponent<{}> = () => {
    const { t } = useTranslation('enterprise/codeintel/indexes/components')

    return (
        <Text alignment="center" className="text-muted w-100 mb-0 mt-1">
            <Icon className="mb-2" svgPath={mdiMapSearch} inline={false} aria-hidden={true} />
            <br />
            {t('no-retention-policies')}
        </Text>
    )
}
