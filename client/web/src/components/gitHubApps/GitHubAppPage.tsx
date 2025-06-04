import { type FC, useEffect, useMemo, useState } from 'react'

import { mdiCog, mdiDelete, mdiOpenInNew, mdiPlus } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Timestamp } from '@sourcegraph/branded/src/components/Timestamp'
import type { ErrorLike } from '@sourcegraph/common'
import { useQuery } from '@sourcegraph/http-client'
import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import {
    Container,
    ErrorAlert,
    PageHeader,
    ButtonLink,
    Icon,
    LoadingSpinner,
    Button,
    H2,
    H3,
    Link,
    Text,
    Grid,
    AnchorLink,
} from '@sourcegraph/wildcard'
// eslint-disable-next-line no-restricted-imports
import type { BreadcrumbItem } from '@sourcegraph/wildcard/src/components/PageHeader'

import { GitHubAppDomain, type GitHubAppByIDResult, type GitHubAppByIDVariables } from '../../graphql-operations'
import { ExternalServiceNode } from '../externalServices/ExternalServiceNode'
import { ConnectionList, SummaryContainer, ConnectionSummary } from '../FilteredConnection/ui'
import { PageTitle } from '../PageTitle'

import { AppLogo } from './AppLogo'
import { AuthProviderMessage } from './AuthProviderMessage'
import { GITHUB_APP_BY_ID_QUERY } from './backend'
import { RemoveGitHubAppModal } from './RemoveGitHubAppModal'

import styles from './GitHubAppCard.module.scss'

interface Props extends TelemetryProps, TelemetryV2Props {
    /**
     * The parent breadcrumb item to show for this page in the header.
     */
    headerParentBreadcrumb: BreadcrumbItem
    /** An optional annotation to show in the page header. */
    headerAnnotation?: React.ReactNode
}

export const GitHubAppPage: FC<Props> = ({
    telemetryService,
    telemetryRecorder,
    headerParentBreadcrumb,
    headerAnnotation,
}) => {
    const { t } = useTranslation('components/gitHubApps')

    const { appID } = useParams()
    const navigate = useNavigate()
    const [removeModalOpen, setRemoveModalOpen] = useState<boolean>(false)

    useEffect(() => {
        telemetryService.logPageView('SiteAdminGitHubApp')
        telemetryRecorder.recordEvent('admin.GitHubApp', 'view')
    }, [telemetryService, telemetryRecorder])
    const [fetchError, setError] = useState<ErrorLike>()

    const { data, loading, error } = useQuery<GitHubAppByIDResult, GitHubAppByIDVariables>(GITHUB_APP_BY_ID_QUERY, {
        variables: { id: appID ?? '' },
    })

    const app = useMemo(() => data?.gitHubApp, [data])

    if (!appID) {
        return null
    }

    const handleError = (error: ErrorLike): [] => {
        setError(error)
        return []
    }

    const onAddInstallation = async (app: NonNullable<GitHubAppByIDResult['gitHubApp']>): Promise<void> => {
        try {
            const req = await fetch(`/githubapp/state?id=${app?.id}&domain=${app?.domain}`)
            const state = await req.text()
            const trailingSlash = app.appURL.endsWith('/') ? '' : '/'
            window.location.assign(`${app.appURL}${trailingSlash}installations/new?state=${state}`)
        } catch (error) {
            handleError(error)
        }
    }

    return (
        <div>
            {app ? (
                <PageTitle title={t('github-app-name', { appName: app.name })} />
            ) : (
                <PageTitle title={t('github-app-title')} />
            )}
            {(error || fetchError) && <ErrorAlert className="mb-3" error={error ?? fetchError} />}
            {loading && !app && <LoadingSpinner />}
            {app && (
                <>
                    {removeModalOpen && (
                        <RemoveGitHubAppModal
                            onCancel={() => setRemoveModalOpen(false)}
                            afterDelete={() => navigate('/site-admin/github-apps')}
                            app={app}
                        />
                    )}
                    <PageHeader
                        path={[
                            { icon: mdiCog },
                            headerParentBreadcrumb,
                            {
                                text: (
                                    <span className="d-flex align-items-center">
                                        <AppLogo
                                            src={app.logo}
                                            name={app.name}
                                            className={classNames(styles.logo, 'mr-2')}
                                        />
                                        <span>{app.name}</span>
                                    </span>
                                ),
                            },
                        ]}
                        annotation={headerAnnotation}
                        className="mb-3"
                        headingElement="h2"
                    />
                    <div className="d-flex align-items-sm-center flex-sm-row flex-column">
                        <span className="timestamps text-muted mb-2">
                            {t('created-label')}
                            <Timestamp date={app.createdAt} />
                            {t('updated-label')}
                            <Timestamp date={app.updatedAt} />
                        </span>
                        <span className="ml-sm-auto">
                            <AnchorLink to={app.appURL} target="_blank">
                                {t('view-in-github')}
                                <Icon inline={true} svgPath={mdiOpenInNew} aria-hidden={true} />
                            </AnchorLink>
                            <Button onClick={() => navigate(-1)} variant="secondary" className="mx-2">
                                {t('cancel-button')}
                            </Button>
                            <Button
                                className="text-nowrap"
                                aria-label="Remove GitHub App"
                                onClick={() => setRemoveModalOpen(true)}
                                variant="danger"
                            >
                                <Icon aria-hidden={true} svgPath={mdiDelete} />
                                {t('delete-button')}
                            </Button>
                        </span>
                    </div>
                </>
            )}
            {app && (
                <Container className="my-3">
                    <Grid columnCount={2} templateColumns="auto 1fr" spacing={[0.6, 2]}>
                        <span className="font-weight-bold">{t('github-app-name-label')}</span>
                        <span>{app.name}</span>
                        <span className="font-weight-bold">{t('url-label')}</span>
                        <AnchorLink to={app.appURL} target="_blank" className="text-decoration-none text-break">
                            {app.appURL}
                        </AnchorLink>
                        <span className="font-weight-bold">{t('app-id-label')}</span>
                        <span>{app.appID}</span>
                    </Grid>
                    {/* Auth provider is only relevant to repos domain GitHub Apps */}
                    {app.domain === GitHubAppDomain.REPOS && <AuthProviderMessage app={app} id={appID} />}

                    <hr className="mt-4 mb-4" />

                    <div>
                        <H2 className="d-flex flex-sm-row flex-column align-items-sm-center mb-3">
                            {t('installations-title')}
                            <Button
                                className="ml-sm-auto mr-sm-0 mr-auto mt-sm-0 mt-2"
                                onClick={() => onAddInstallation(app)}
                                variant="primary"
                            >
                                <Icon svgPath={mdiPlus} aria-hidden={true} />
                                {t('add-installation-button')}
                            </Button>
                        </H2>
                        <Text>{t('installation-description')}</Text>
                        <Text>
                            {t('multiple-installations-info')}
                            <AnchorLink to="https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/making-a-github-app-public-or-private">
                                {t('public-installation-label')}
                            </AnchorLink>
                            <Trans
                                i18nKey="private-installation-info"
                                components={{
                                    '0': (
                                        <Link
                                            to="/help/admin/code_hosts/github#multiple-installations"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        />
                                    ),
                                }}
                            />
                        </Text>
                        <Text>
                            <Trans
                                i18nKey="organization-owners-info"
                                components={{
                                    '0': (
                                        <Link
                                            to="https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization#organization-owners"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        />
                                    ),
                                }}
                            />
                        </Text>
                        <div className="list-group mb-3" aria-label="GitHub App Installations">
                            {app.installations?.length === 0 ? (
                                <Text>{t('no-installations-message')}</Text>
                            ) : (
                                app.installations?.map(installation => {
                                    const { t } = useTranslation('components/gitHubApps')

                                    return (
                                        <Container
                                            className={classNames(styles.installation, 'p-3')}
                                            key={installation.id}
                                        >
                                            <div className="d-flex align-items-center">
                                                <Link
                                                    to={installation.account.url}
                                                    className="d-flex align-items-center"
                                                >
                                                    <AppLogo
                                                        src={installation.account.avatarURL}
                                                        name={installation.account.login}
                                                        alt={t('account-avatar-label')}
                                                        className={styles.logo}
                                                    />
                                                    <div className="d-flex flex-column ml-3">
                                                        {installation.account.login}
                                                        <span className="text-muted">
                                                            {t('id-label')}
                                                            {installation.id}
                                                            {t('type-label')}
                                                            {installation.account.type}
                                                        </span>
                                                    </div>
                                                </Link>
                                                <AnchorLink to={installation.url} target="_blank" className="ml-auto">
                                                    <small>
                                                        {t('view-in-github-label')}
                                                        <Icon inline={true} svgPath={mdiOpenInNew} aria-hidden={true} />
                                                    </small>
                                                </AnchorLink>
                                            </div>
                                            {/* Code host connections are only relevant to repos domain GitHub Apps */}
                                            {app.domain === GitHubAppDomain.REPOS && (
                                                <div className="mt-4">
                                                    <H3 className="d-flex align-items-center mb-0">
                                                        {t('code-host-connections-title')}
                                                        <ButtonLink
                                                            variant="primary"
                                                            className="ml-auto"
                                                            to={`/site-admin/external-services/new?id=ghapp&appID=${
                                                                app.appID
                                                            }&installationID=${installation.id}&url=${encodeURI(
                                                                app.baseURL
                                                            )}`}
                                                            size="sm"
                                                        >
                                                            <Icon svgPath={mdiPlus} aria-hidden={true} />
                                                            {t('add-connection-button')}
                                                        </ButtonLink>
                                                    </H3>
                                                    {installation.externalServices?.nodes?.length > 0 ? (
                                                        <>
                                                            <ConnectionList
                                                                as="ul"
                                                                className={styles.listGroup}
                                                                aria-label="Code Host Connections"
                                                            >
                                                                {installation.externalServices?.nodes?.map(node => (
                                                                    <ExternalServiceNode
                                                                        key={node.id}
                                                                        node={node}
                                                                        editingDisabled={false}
                                                                    />
                                                                ))}
                                                            </ConnectionList>
                                                            {installation.externalServices && (
                                                                <SummaryContainer className="mt-2" centered={true}>
                                                                    <ConnectionSummary
                                                                        noSummaryIfAllNodesVisible={false}
                                                                        first={100}
                                                                        centered={true}
                                                                        connection={installation.externalServices}
                                                                        noun="code host connection"
                                                                        pluralNoun="code host connections"
                                                                        hasNextPage={false}
                                                                    />
                                                                </SummaryContainer>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <Text className="text-center mt-4">
                                                            {t('no-code-host-connections-message')}
                                                        </Text>
                                                    )}
                                                </div>
                                            )}
                                        </Container>
                                    )
                                })
                            )}
                            <SummaryContainer className="mt-3" centered={true}>
                                <ConnectionSummary
                                    noSummaryIfAllNodesVisible={false}
                                    first={app?.installations?.length ?? 0}
                                    centered={true}
                                    connection={{
                                        nodes: app?.installations ?? [],
                                        totalCount: app?.installations?.length ?? 0,
                                    }}
                                    noun="installation"
                                    pluralNoun="installations"
                                    hasNextPage={false}
                                />
                            </SummaryContainer>
                        </div>
                    </div>
                </Container>
            )}
        </div>
    )
}
