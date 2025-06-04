import { useEffect, useMemo } from 'react'

import { mdiPlus } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { useQuery } from '@sourcegraph/http-client'
import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { EVENT_LOGGER } from '@sourcegraph/shared/src/telemetry/web/eventLogger'
import { ButtonLink, Container, ErrorAlert, Icon, Link, LoadingSpinner, PageHeader } from '@sourcegraph/wildcard'

import { type GitHubAppsResult, type GitHubAppsVariables, GitHubAppDomain } from '../../graphql-operations'
import {
    ConnectionContainer,
    ConnectionLoading,
    ConnectionList,
    ConnectionSummary,
    SummaryContainer,
} from '../FilteredConnection/ui'
import { PageTitle } from '../PageTitle'

import { GITHUB_APPS_QUERY } from './backend'
import { GitHubAppCard } from './GitHubAppCard'
import { GitHubAppFailureAlert } from './GitHubAppFailureAlert'

import styles from './GitHubAppsPage.module.scss'

interface Props extends TelemetryV2Props {
    batchChangesEnabled: boolean
}

export const GitHubAppsPage: React.FC<Props> = ({ batchChangesEnabled, telemetryRecorder }) => {
    const { t } = useTranslation('components/gitHubApps')

    const { data, loading, error, refetch } = useQuery<GitHubAppsResult, GitHubAppsVariables>(GITHUB_APPS_QUERY, {
        variables: {
            domain: GitHubAppDomain.REPOS,
        },
    })
    const gitHubApps = useMemo(() => data?.gitHubApps?.nodes ?? [], [data])

    useEffect(() => {
        EVENT_LOGGER.logPageView('SiteAdminGitHubApps')
        telemetryRecorder.recordEvent('admin.GitHubApps', 'view')
    }, [telemetryRecorder])

    const location = useLocation()
    const success = new URLSearchParams(location.search).get('success') === 'true'
    const setupError = new URLSearchParams(location.search).get('error')

    const reloadApps = async (): Promise<void> => {
        await refetch({})
    }

    if (loading && !data) {
        return <LoadingSpinner />
    }

    return (
        <>
            <PageTitle title={t('github-apps-title')} />
            <PageHeader
                headingElement="h2"
                path={[{ text: 'GitHub Apps' }]}
                className={classNames(styles.pageHeader, 'mb-3')}
                description={
                    <>
                        <Trans
                            i18nKey="github-apps-creation-description"
                            components={{
                                '0': <Link to="/help/admin/code_hosts/github#using-a-github-app" target="_blank" />,
                            }}
                        />

                        {batchChangesEnabled && (
                            <>
                                <Trans
                                    i18nKey="github-apps-batch-changes-instruction"
                                    components={{ '0': <Link to="/site-admin/batch-changes" /> }}
                                />
                            </>
                        )}
                    </>
                }
                actions={
                    <ButtonLink
                        to="/site-admin/github-apps/new"
                        className="ml-auto text-nowrap"
                        variant="primary"
                        as={Link}
                    >
                        <Icon aria-hidden={true} svgPath={mdiPlus} />
                        {t('create-github-app-button')}
                    </ButtonLink>
                }
            />
            <Container className="mb-3">
                {!success && setupError && <GitHubAppFailureAlert error={setupError} />}
                <ConnectionContainer>
                    {error && <ErrorAlert error={error} />}
                    {loading && !data && <ConnectionLoading />}
                    <ConnectionList as="ul" className="list-group" aria-label="GitHub Apps">
                        {gitHubApps?.map(app => (
                            <GitHubAppCard key={app.id} app={app} refetch={reloadApps} />
                        ))}
                    </ConnectionList>
                    <SummaryContainer className="mt-2" centered={true}>
                        <ConnectionSummary
                            emptyElement={
                                <div className="text-center text-muted">{t('no-github-apps-created-message')}</div>
                            }
                            noSummaryIfAllNodesVisible={false}
                            first={gitHubApps?.length ?? 0}
                            centered={true}
                            connection={{
                                nodes: gitHubApps ?? [],
                                totalCount: gitHubApps?.length ?? 0,
                            }}
                            noun="GitHub App"
                            pluralNoun="GitHub Apps"
                            hasNextPage={false}
                        />
                    </SummaryContainer>
                </ConnectionContainer>
            </Container>
        </>
    )
}
