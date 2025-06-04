import React, { useMemo } from 'react'

import { mdiChevronRight } from '@mdi/js'
import { useTranslation } from 'react-i18next'

import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { EVENT_LOGGER } from '@sourcegraph/shared/src/telemetry/web/eventLogger'
import { Link, LoadingSpinner, CardHeader, Card, Icon, ErrorAlert } from '@sourcegraph/wildcard'

import { Page } from '../../components/Page'
import { PageTitle } from '../../components/PageTitle'
import { GitReferenceNode } from '../GitReference'

import { useBranches } from './backend'
import type { RepositoryBranchesAreaPageProps } from './RepositoryBranchesArea'

import styles from './RepositoryBranchesOverviewPage.module.scss'

interface Props extends RepositoryBranchesAreaPageProps, TelemetryV2Props {}

/** A page with an overview of the repository's branches. */
export const RepositoryBranchesOverviewPage: React.FunctionComponent<Props> = ({ repo, telemetryRecorder }) => {
    const { t } = useTranslation('repo/branches')

    useMemo(() => {
        EVENT_LOGGER.logViewEvent('RepositoryBranchesOverview')
        telemetryRecorder.recordEvent('repo.branches', 'view')
    }, [telemetryRecorder])

    const { loading, error, activeBranches, defaultBranch, hasMoreActiveBranches } = useBranches(repo.id, 10)

    if (loading) {
        return <LoadingSpinner className="mt-2 mx-auto" />
    }

    if (error) {
        return <ErrorAlert className="mt-2" error={error} />
    }

    return (
        <Page>
            <PageTitle title={t('branches-label')} />

            <div>
                {defaultBranch && (
                    <Card className={styles.card}>
                        <CardHeader>{t('default-branch-label')}</CardHeader>
                        <ul className="list-group list-group-flush">
                            <GitReferenceNode
                                node={defaultBranch}
                                ariaLabel={t('view-repo-with-default-branch', {
                                    defaultBranchDisplayName: defaultBranch.displayName,
                                })}
                            />
                        </ul>
                    </Card>
                )}
                {activeBranches.length > 0 && (
                    <Card className={styles.card}>
                        <CardHeader>{t('active-branches-label')}</CardHeader>
                        <ul className="list-group list-group-flush" data-testid="active-branches-list">
                            {activeBranches.map((gitReference, index) => {
                                const { t } = useTranslation('repo/branches')

                                return (
                                    <GitReferenceNode
                                        key={index}
                                        node={gitReference}
                                        ariaLabel={t('view-repo-with-git-reference', {
                                            gitReferenceDisplayName: gitReference.displayName,
                                        })}
                                    />
                                )
                            })}
                            {hasMoreActiveBranches && (
                                <li className="list-group-item list-group-item-action">
                                    <Link
                                        className="py-2 d-flex align-items-center"
                                        to={`/${repo.name}/-/branches/all`}
                                    >
                                        {t('view-more-branches-action')}
                                        <Icon aria-hidden={true} svgPath={mdiChevronRight} />
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </Card>
                )}
            </div>
        </Page>
    )
}
