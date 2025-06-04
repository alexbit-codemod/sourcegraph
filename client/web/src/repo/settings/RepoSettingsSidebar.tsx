import React, { useState } from 'react'

import { mdiMenu } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { Button, Icon } from '@sourcegraph/wildcard'

import { SidebarGroupHeader, SidebarGroup, SidebarNavItem } from '../../components/Sidebar'
import type { SettingsAreaRepositoryFields } from '../../graphql-operations'
import type { NavGroupDescriptor } from '../../util/contributions'

export interface RepoSettingsSideBarGroup extends Omit<NavGroupDescriptor, 'condition'> {}

export type RepoSettingsSideBarGroups = readonly RepoSettingsSideBarGroup[]

interface Props {
    repoSettingsSidebarGroups: RepoSettingsSideBarGroups
    className?: string
    repo: SettingsAreaRepositoryFields
}

/**
 * Sidebar for repository settings pages.
 */
export const RepoSettingsSidebar: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    repoSettingsSidebarGroups,
    className,
    repo,
}: Props) => {
    const { t } = useTranslation('repo/settings')

    const [isMobileExpanded, setIsMobileExpanded] = useState(false)

    return (
        <>
            <Button className="d-sm-none align-self-start mb-3" onClick={() => setIsMobileExpanded(!isMobileExpanded)}>
                <Icon aria-hidden={true} svgPath={mdiMenu} className="mr-2" />
                {t('toggle-menu', { isMobileExpanded })}
            </Button>
            <div className={classNames(className, 'd-sm-block', !isMobileExpanded && 'd-none')}>
                {repoSettingsSidebarGroups.map(({ header, items }, index) => (
                    <SidebarGroup key={index}>
                        {header && <SidebarGroupHeader label={header.label} />}
                        {items.map(({ label, to, exact }) => (
                            <SidebarNavItem
                                to={`${repo.url}/-/settings${to}`}
                                key={label}
                                onClick={() => setIsMobileExpanded(false)}
                                exact={exact}
                            >
                                {label}
                            </SidebarNavItem>
                        ))}
                    </SidebarGroup>
                ))}
            </div>
        </>
    )
}
