import React from 'react'

import { mdiAccountMultiple } from '@mdi/js'
import { useTranslation, Trans } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { Alert, Badge, Link, PageHeader, ProductStatusBadge } from '@sourcegraph/wildcard'

import type { TeamAreaRouteContext } from './TeamArea'

interface Props extends Pick<TeamAreaRouteContext, 'team'> {
    className?: string
}

/**
 * Header for the team area.
 */
export const TeamHeader: React.FunctionComponent<React.PropsWithChildren<Props>> = ({ team, className = '' }) => {
    const { t } = useTranslation('team/area')

    const url = team.url

    return (
        <div className={className}>
            <div className="container">
                {team && (
                    <>
                        <PageHeader className="mb-3">
                            <PageHeader.Heading as="h2" styleAs="h1">
                                <PageHeader.Breadcrumb to="/teams" icon={mdiAccountMultiple}>
                                    {t('teams-title')}
                                </PageHeader.Breadcrumb>
                                <PageHeader.Breadcrumb>
                                    {team.displayName ? (
                                        <>
                                            {team.displayName} ({team.name})
                                        </>
                                    ) : (
                                        team.name
                                    )}
                                    <ProductStatusBadge className="ml-2" status="experimental" />
                                </PageHeader.Breadcrumb>
                            </PageHeader.Heading>
                        </PageHeader>

                        {team.readonly && (
                            <Alert variant="info" className="mb-3">
                                <Trans
                                    i18nKey="external-team-management-info"
                                    components={{ '0': <Link to="/help/admin/teams#configuring-teams" /> }}
                                />
                            </Alert>
                        )}

                        <nav className="d-flex align-items-end justify-content-between">
                            <ul className="nav nav-tabs w-100">
                                <li className="nav-item">
                                    <NavLink to={url} className="nav-link" end={true}>
                                        <span>
                                            <span className="text-content" data-tab-content="Profile">
                                                {t('profile-title')}
                                            </span>
                                        </span>
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to={`${url}/members`} className="nav-link" end={true}>
                                        <span>
                                            <span className="text-content" data-tab-content="Members">
                                                <span>
                                                    {t('members-title')}
                                                    <Badge pill={true}>{team.members.totalCount}</Badge>
                                                </span>
                                            </span>
                                        </span>
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to={`${url}/child-teams`} className="nav-link" end={true}>
                                        <span>
                                            <span className="text-content" data-tab-content="Child teams">
                                                <span>
                                                    {t('child-teams-title')}
                                                    <Badge pill={true}>{team.childTeams.totalCount}</Badge>
                                                </span>
                                            </span>
                                        </span>
                                    </NavLink>
                                </li>
                            </ul>
                        </nav>
                    </>
                )}
            </div>
        </div>
    )
}
