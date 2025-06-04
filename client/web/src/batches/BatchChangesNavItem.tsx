import React from 'react'

import { useTranslation } from 'react-i18next'

import { NavItem, NavLink } from '../nav'
import type { NavLinkProps } from '../nav/NavBar'

import { BatchChangesIconNav } from './icons'

interface Props extends Pick<NavLinkProps, 'variant'> {
    // Nothing for now.
}

/**
 * An item in {@link GlobalNavbar} that links to the batch changes area.
 */
export const BatchChangesNavItem: React.FunctionComponent<React.PropsWithChildren<Props>> = ({ variant }) => {
    const { t } = useTranslation('batches')

    return (
        <NavItem icon={BatchChangesIconNav}>
            <NavLink to="/batch-changes" variant={variant}>
                {t('batch-changes')}
            </NavLink>
        </NavItem>
    )
}
