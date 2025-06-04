import type { FC } from 'react'

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

export const RepositoryBranchesNavbar: FC<{ repo: string; className: string }> = ({ repo, className }) => {
    const { t } = useTranslation('repo/branches')

    return (
        <ul className={classNames('nav', className)}>
            <li className="nav-item">
                <NavLink
                    className={({ isActive }) => classNames('nav-link', isActive && 'font-weight-bold')}
                    to={`/${repo}/-/branches`}
                    end={true}
                >
                    {t('overview')}
                </NavLink>
            </li>
            <li className="nav-item">
                <NavLink
                    className={({ isActive }) => classNames('nav-link', isActive && 'font-weight-bold')}
                    to={`/${repo}/-/branches/all`}
                >
                    {t('all-branches')}
                </NavLink>
            </li>
        </ul>
    )
}
