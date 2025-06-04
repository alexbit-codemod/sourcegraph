import React from 'react'

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { CodeSnippet } from '@sourcegraph/branded/src/components/CodeSnippet'
import { Alert, H5, Text } from '@sourcegraph/wildcard'

import { AccessTokenScopes } from '../../auth/accessToken'
import { CopyableText } from '../../components/CopyableText'
import type { AccessTokenFields } from '../../graphql-operations'

interface AccessTokenCreatedAlertProps {
    token: AccessTokenFields
    tokenSecret: string
    className?: string
}

/**
 * Displays a message informing the user to copy and save the newly created access token.
 */
export const AccessTokenCreatedAlert: React.FunctionComponent<
    React.PropsWithChildren<AccessTokenCreatedAlertProps>
> = ({ token, tokenSecret, className }) => {
    const { t } = useTranslation('settings/tokens')

    const isSudoToken = token.scopes.includes(AccessTokenScopes.SiteAdminSudo)
    return (
        <Alert className={classNames('access-token-created-alert', className)} variant="success">
            <Text>{t('copy-access-token-warning')}</Text>
            <CopyableText className="test-access-token" text={tokenSecret} size={48} secret={true}>
                {({ isRedacted }) => {
                    const { t } = useTranslation('settings/tokens')

                    const secretToDisplay = isRedacted ? tokenSecret.replaceAll(/./g, '*') : tokenSecret
                    return (
                        <>
                            <H5 className="mt-4 mb-2">
                                <strong>{t('example-usage')}</strong>
                            </H5>
                            <CodeSnippet
                                code={curlExampleCommand(secretToDisplay, isSudoToken)}
                                className="mb-0"
                                language="bash"
                                withCopyButton={true}
                            />
                        </>
                    )
                }}
            </CopyableText>
        </Alert>
    )
}

function curlExampleCommand(tokenSecret: string, isSudoToken: boolean): string {
    const credentials = isSudoToken
        ? `token-sudo user="SUDO-TO-USERNAME",token="${tokenSecret}"`
        : `token ${tokenSecret}`

    return `curl \\
  -H 'Authorization: ${credentials}' \\
  -d '{"query":"query { currentUser { username } }"}' \\
  ${new URL('/.api/graphql', window.context.externalURL).href}`
}
