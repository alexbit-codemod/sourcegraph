import React from 'react'

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import styles from '../index.module.scss'

interface BrandHeaderProps {
    isLightTheme: boolean
}

export const BrandHeader: React.FunctionComponent<BrandHeaderProps> = ({ isLightTheme }) => {
    const { t } = useTranslation('../../vscode/src/webview/search-panel/components')

    return (
        <>
            <img
                className={classNames(styles.logo)}
                src={`https://sourcegraph.com/.assets/img/sourcegraph-logo-${isLightTheme ? 'light' : 'dark'}.svg`}
                alt={t('sourcegraph-logo')}
            />
            <div data-testid="brand-header" className={classNames(styles.logoText)}>
                {t('search-open-source-repositories')}
            </div>
        </>
    )
}
