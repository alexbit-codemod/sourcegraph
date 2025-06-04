import React from 'react'

import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { Container, H3, Link, ProductStatusBadge, Text } from '@sourcegraph/wildcard'

import { DismissibleAlert } from '../../../components/DismissibleAlert'
import type { UseShowMorePaginationResult } from '../../../components/FilteredConnection/hooks/useShowMorePagination'
import {
    ConnectionContainer,
    ConnectionError,
    ConnectionList,
    ConnectionLoading,
    ConnectionSummary,
    ShowMoreButton,
    SummaryContainer,
} from '../../../components/FilteredConnection/ui'
import { GitHubAppFailureAlert } from '../../../components/gitHubApps/GitHubAppFailureAlert'
import {
    type BatchChangesCodeHostFields,
    GitHubAppKind,
    type GlobalBatchChangesCodeHostsResult,
    type Scalars,
    type UserBatchChangesCodeHostsResult,
} from '../../../graphql-operations'

import { useGlobalBatchChangesCodeHostConnection, useUserBatchChangesCodeHostConnection } from './backend'
import { CommitSigningIntegrationNode } from './CommitSigningIntegrationNode'

export const GlobalCommitSigningIntegrations: React.FunctionComponent<React.PropsWithChildren<{}>> = () => (
    <CommitSigningIntegrations connectionResult={useGlobalBatchChangesCodeHostConnection()} readOnly={false} />
)

interface UserCommitSigningIntegrationsProps {
    userID: Scalars['ID']
}

export const UserCommitSigningIntegrations: React.FunctionComponent<
    React.PropsWithChildren<UserCommitSigningIntegrationsProps>
> = ({ userID }) => (
    <CommitSigningIntegrations connectionResult={useUserBatchChangesCodeHostConnection(userID)} readOnly={true} />
)

interface CommitSigningIntegrationsProps {
    readOnly: boolean
    connectionResult: UseShowMorePaginationResult<
        GlobalBatchChangesCodeHostsResult | UserBatchChangesCodeHostsResult,
        BatchChangesCodeHostFields
    >
}

export const CommitSigningIntegrations: React.FunctionComponent<
    React.PropsWithChildren<CommitSigningIntegrationsProps>
> = ({ connectionResult, readOnly }) => {
    const { t } = useTranslation('enterprise/batches/settings')

    const { loading, hasNextPage, fetchMore, connection, error, refetchAll } = connectionResult

    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const kind = searchParams.get('kind')
    const success = searchParams.get('success') === 'true'
    const appName = searchParams.get('app_name')
    const setupError = searchParams.get('error')
    const gitHubAppKind = searchParams.get('kind')
    const shouldShowError = !success && setupError && !readOnly && kind === GitHubAppKind.COMMIT_SIGNING
    return (
        <Container>
            <H3>
                {t('commit-signing-integrations')}
                <ProductStatusBadge status="beta" className="ml-2" />
            </H3>
            <Text>
                {t('connect-github-apps-batch-changes')}
                {readOnly ? (
                    'Contact your site admin to manage connections.'
                ) : (
                    <Link to="/help/admin/config/batch_changes#commit-signing-for-github" target="_blank">
                        {t('batch-changes-github-app-configuration')}
                    </Link>
                )}
            </Text>
            <ConnectionContainer className="mb-3">
                {error && <ConnectionError errors={[error.message]} />}
                {loading && !connection && <ConnectionLoading />}
                {success && !readOnly && gitHubAppKind === GitHubAppKind.COMMIT_SIGNING && (
                    <DismissibleAlert
                        className="mb-3"
                        variant="success"
                        partialStorageKey={`batch-changes-commit-signing-integration-success-${appName}`}
                    >
                        {t('github-app-successfully-connected', { appName, appNameLength: appName?.length })}
                    </DismissibleAlert>
                )}
                {shouldShowError && <GitHubAppFailureAlert error={setupError} />}
                <ConnectionList as="ul" className="list-group" aria-label="commit signing integrations">
                    {connection?.nodes?.map(node =>
                        node.supportsCommitSigning ? (
                            <CommitSigningIntegrationNode
                                key={node.externalServiceURL}
                                node={node}
                                readOnly={readOnly}
                                refetch={refetchAll}
                            />
                        ) : null
                    )}
                </ConnectionList>
                {connection && (
                    <SummaryContainer className="mt-2">
                        <ConnectionSummary
                            noSummaryIfAllNodesVisible={true}
                            first={30}
                            centered={true}
                            connection={connection}
                            noun="code host commit signing integration"
                            pluralNoun="code host commit signing integrations"
                            hasNextPage={hasNextPage}
                        />
                        {hasNextPage && <ShowMoreButton centered={true} onClick={fetchMore} />}
                    </SummaryContainer>
                )}
            </ConnectionContainer>
            <Text className="mb-0">{t('code-host-support-commit-signing')}</Text>
        </Container>
    )
}
