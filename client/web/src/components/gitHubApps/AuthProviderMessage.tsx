import { type FC, useMemo, useState } from 'react'

import { mdiEye, mdiEyeOffOutline } from '@mdi/js'
import { parse as parseJSONC } from 'jsonc-parser'
import { useTranslation, Trans } from 'react-i18next'

import { useQuery } from '@sourcegraph/http-client'
import { Icon, Button, Alert, Text, Link, Code } from '@sourcegraph/wildcard'

import type {
    GitHubAppByIDResult,
    GitHubAppClientSecretResult,
    GitHubAppClientSecretVariables,
    SiteResult,
    SiteVariables,
} from '../../graphql-operations'

import { GITHUB_APP_CLIENT_SECRET_QUERY, SITE_SETTINGS_QUERY } from './backend'

interface Props {
    app: GitHubAppByIDResult['gitHubApp']
    id: string
}

const AuthProviderJSON: FC<Props> = ({ app, id }) => {
    const { t } = useTranslation('components/gitHubApps')

    const [reveal, setReveal] = useState(false)
    const { data, loading, error } = useQuery<GitHubAppClientSecretResult, GitHubAppClientSecretVariables>(
        GITHUB_APP_CLIENT_SECRET_QUERY,
        {
            variables: { id },
            skip: !reveal,
        }
    )

    const [clientID, clientSecret] = useMemo(() => {
        if (loading) {
            return ['LOADING...', 'LOADING...']
        }
        if (reveal && data) {
            const clientID = app?.clientID ?? 'NO CLIENT ID'
            const clientSecret = data?.gitHubApp?.clientSecret || 'NO CLIENT SECRET FOUND'
            return [clientID, clientSecret]
        }
        return ['REDACTED', 'REDACTED']
    }, [data, loading, reveal, app?.clientID])

    const providerJson = useMemo(() => {
        // typescript compiler is not smart enough to know that app is not null
        const url = app?.baseURL ?? null
        return JSON.stringify(
            {
                displayName: `GitHub App ${app?.name}`,
                type: 'github',
                clientID,
                clientSecret,
                url,
            },
            null,
            4
        )
    }, [clientID, clientSecret, app?.baseURL, app?.name])

    if (error) {
        return (
            <Alert variant="danger" className="m-3">
                {t('error-fetching-github-app-client-secret')}
                {error.message}
            </Alert>
        )
    }

    return (
        <>
            <Code>{providerJson}</Code>
            <br />
            <Button className="mt-2" size="sm" variant="secondary" onClick={() => setReveal(!reveal)}>
                <Icon aria-hidden={true} svgPath={reveal ? mdiEyeOffOutline : mdiEye} className="mr-1" />
                {reveal ? 'Hide' : 'Reveal secret'}
            </Button>
        </>
    )
}

export const AuthProviderMessage: FC<Props> = ({ app, id }) => {
    const { t } = useTranslation('components/gitHubApps')

    const { data, loading, error } = useQuery<SiteResult, SiteVariables>(SITE_SETTINGS_QUERY, {
        skip: !app || !id,
    })
    const siteConfig = useMemo(() => (data ? parseJSONC(data.site.configuration.effectiveContents) : null), [data])

    if (!app || !id) {
        return null
    }

    const hasProvider = siteConfig?.['auth.providers'].find(
        (provider: { type: string; url: string; clientID: string }) =>
            provider.type === 'github' && provider.url === app.baseURL && provider.clientID === app.clientID
    )

    if (!siteConfig || hasProvider || loading) {
        return null
    }

    if (error) {
        return (
            <Alert variant="danger" className="m-3">
                {t('error-fetching-site-configuration')}
                {error.message}
            </Alert>
        )
    }

    return (
        <Alert variant="warning" className="mt-4 mb-4">
            <Text>
                <Trans
                    i18nKey="add-configuration-for-github-app-login"
                    components={{ '0': <Link to="/site-admin/configuration" /> }}
                />
            </Text>
            <AuthProviderJSON app={app} id={id} />
        </Alert>
    )
}
