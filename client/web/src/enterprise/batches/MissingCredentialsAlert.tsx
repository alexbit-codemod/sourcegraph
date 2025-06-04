import React from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { pluralize } from '@sourcegraph/common'
import { gql } from '@sourcegraph/http-client'
import { Alert, Link, Text } from '@sourcegraph/wildcard'

import type { AuthenticatedUser } from '../../auth'
import type { ViewerBatchChangesCodeHostsFields } from '../../graphql-operations'

import { CodeHost } from './CodeHost'

export const VIEWER_BATCH_CHANGES_CODE_HOST_FRAGMENT = gql`
    fragment ViewerBatchChangesCodeHostsFields on BatchChangesCodeHostConnection {
        totalCount
        nodes {
            externalServiceURL
            externalServiceKind
        }
    }
`

export interface MissingCredentialsAlertProps {
    authenticatedUser: Pick<AuthenticatedUser, 'url'>
    viewerBatchChangesCodeHosts: ViewerBatchChangesCodeHostsFields
}

export const MissingCredentialsAlert: React.FunctionComponent<
    React.PropsWithChildren<MissingCredentialsAlertProps>
> = ({ viewerBatchChangesCodeHosts, authenticatedUser }) => {
    const { t } = useTranslation('enterprise/batches')

    if (viewerBatchChangesCodeHosts.totalCount === 0) {
        return <></>
    }
    return (
        <Alert variant="warning">
            <Text>
                <strong>
                    {t('no-credentials-configured')}
                    {pluralize('this code host', viewerBatchChangesCodeHosts.totalCount, 'these code hosts')}
                </strong>
            </Text>
            <ul>
                {viewerBatchChangesCodeHosts.nodes.map(node => (
                    <CodeHost {...node} key={node.externalServiceKind + node.externalServiceURL} />
                ))}
            </ul>
            <Text className="mb-0">
                <Trans
                    i18nKey="credentials-required-to-publish-changesets"
                    components={{
                        '0': (
                            <Link
                                to={`${authenticatedUser.url}/settings/batch-changes`}
                                target="_blank"
                                rel="noopener"
                            />
                        ),
                    }}
                />
            </Text>
        </Alert>
    )
}
