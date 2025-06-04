import React, { useEffect } from 'react'

import { mdiAccount } from '@mdi/js'
import { useTranslation, Trans } from 'react-i18next'

import { displayRepoName } from '@sourcegraph/shared/src/components/RepoLink'
import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { H1, Icon, Link, PageHeader, ProductStatusBadge } from '@sourcegraph/wildcard'

import type { AuthenticatedUser } from '../../auth'
import type { BreadcrumbSetters } from '../../components/Breadcrumbs'
import { Page } from '../../components/Page'
import { PageTitle } from '../../components/PageTitle'
import type { RepositoryFields } from '../../graphql-operations'

import { RepositoryOwnPageContents } from './RepositoryOwnPageContents'

/**
 * Properties passed to all page components in the repository code navigation area.
 */
export interface RepositoryOwnAreaPageProps
    extends Pick<BreadcrumbSetters, 'useBreadcrumb'>,
        TelemetryProps,
        TelemetryV2Props {
    /** The active repository. */
    repo: RepositoryFields
    authenticatedUser: Pick<AuthenticatedUser, 'siteAdmin' | 'permissions'> | null
}

const EDIT_PAGE_BREADCRUMB = { key: 'edit-own', element: 'Upload CODEOWNERS' }

export const RepositoryOwnEditPage: React.FunctionComponent<Omit<RepositoryOwnAreaPageProps, 'telemetryService'>> = ({
    useBreadcrumb,
    repo,
    authenticatedUser,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('enterprise/own')

    const breadcrumbSetters = useBreadcrumb({
        key: 'own',
        element: <Link to={`/${repo.name}/-/own`}>{t('ownership-title')}</Link>,
    })
    breadcrumbSetters.useBreadcrumb(EDIT_PAGE_BREADCRUMB)

    useEffect(() => {
        telemetryRecorder.recordEvent('repo.ownership.edit', 'view')
    }, [telemetryRecorder])

    return (
        <Page>
            <PageTitle title={t('ownership-repo-name', { displayRepoNameRepoName: displayRepoName(repo.name) })} />
            <PageHeader
                description={
                    <>
                        <Trans i18nKey="ownership-code-data-info" components={{ '0': <Link to="/help/own" /> }} />
                    </>
                }
            >
                <H1 as="h2" className="d-flex align-items-center">
                    <Icon svgPath={mdiAccount} aria-hidden={true} />
                    <span className="ml-2">{t('ownership-title-duplicate')}</span>
                    <ProductStatusBadge status="beta" className="ml-2" />
                </H1>
            </PageHeader>

            <RepositoryOwnPageContents
                repo={repo}
                authenticatedUser={authenticatedUser}
                telemetryRecorder={telemetryRecorder}
            />
        </Page>
    )
}
