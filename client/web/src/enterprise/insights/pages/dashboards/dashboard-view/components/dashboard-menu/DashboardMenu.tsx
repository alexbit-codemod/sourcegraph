import React from 'react'

import { mdiDotsVertical } from '@mdi/js'
import classNames from 'classnames'
import { noop } from 'lodash'
import { useTranslation } from 'react-i18next'

import {
    Button,
    Icon,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    Position,
    Tooltip,
} from '@sourcegraph/wildcard'

import type { CustomInsightDashboard } from '../../../../../core'
import { useUiFeatures } from '../../../../../hooks'

import styles from './DashboardMenu.module.scss'

export enum DashboardMenuAction {
    CopyLink,
    Delete,
    Configure,
    AddRemoveInsights,
    ResetGridLayout,
}

export interface DashboardMenuProps {
    dashboard?: CustomInsightDashboard
    tooltipText?: string
    className?: string
    onSelect?: (action: DashboardMenuAction) => void
}

export const DashboardMenu: React.FunctionComponent<React.PropsWithChildren<DashboardMenuProps>> = props => {
    const { t } = useTranslation('enterprise/insights/pages/dashboards/dashboard-view/components/dashboard-menu')

    const { dashboard, tooltipText, className, onSelect = noop } = props

    const { dashboard: dashboardPermission } = useUiFeatures()
    const menuPermissions = dashboardPermission.getContextActionsPermissions(dashboard)

    return (
        <Menu>
            <Tooltip content={tooltipText} placement="right">
                <MenuButton variant="icon" outline={true} className={classNames(className, styles.triggerButton)}>
                    <Icon svgPath={mdiDotsVertical} height={16} width={16} aria-label="dashboard options" />
                </MenuButton>
            </Tooltip>

            <MenuList className={styles.menuList} position={Position.bottomStart}>
                {menuPermissions.configure.display && (
                    <Tooltip content={menuPermissions.configure.tooltip} placement="right">
                        <MenuItem
                            as={Button}
                            outline={true}
                            disabled={menuPermissions.configure.disabled}
                            className={styles.menuItem}
                            onSelect={() => onSelect(DashboardMenuAction.Configure)}
                        >
                            {t('configure-dashboard')}
                        </MenuItem>
                    </Tooltip>
                )}

                {menuPermissions.copy.display && (
                    <MenuItem
                        as={Button}
                        outline={true}
                        disabled={menuPermissions.copy.disabled}
                        className={styles.menuItem}
                        data-testid="copy-link"
                        onSelect={() => onSelect(DashboardMenuAction.CopyLink)}
                    >
                        {t('copy-link')}
                    </MenuItem>
                )}

                <MenuItem
                    as={Button}
                    outline={true}
                    className={styles.menuItem}
                    onSelect={() => onSelect(DashboardMenuAction.ResetGridLayout)}
                >
                    {t('reset-grid-layout')}
                </MenuItem>

                {(menuPermissions.configure.display || menuPermissions.copy.display) &&
                    menuPermissions.delete.display && <MenuDivider />}

                {menuPermissions.delete.display && (
                    <Tooltip content={menuPermissions.delete.tooltip} placement="right">
                        <MenuItem
                            as={Button}
                            outline={true}
                            disabled={menuPermissions.delete.disabled}
                            className={classNames(styles.menuItem, styles.menuItemDanger)}
                            onSelect={() => onSelect(DashboardMenuAction.Delete)}
                        >
                            {t('delete-action')}
                        </MenuItem>
                    </Tooltip>
                )}
            </MenuList>
        </Menu>
    )
}
