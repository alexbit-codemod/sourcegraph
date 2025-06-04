import React from 'react'

import classNames from 'classnames'
import LockIcon from 'mdi-react/LockOutlineIcon'
import { useTranslation } from 'react-i18next'

import styles from './LockedChart.module.scss'

export const LockedChart: React.FunctionComponent<React.PropsWithChildren<{ className?: string }>> = ({
    className,
}) => {
    const { t } = useTranslation('enterprise/insights/components/views/chart/locked')

    return (
        <section className={classNames(styles.wrapper, className)}>
            <LockIcon size={40} />
            <div className={classNames(styles.banner)}>
                <span>{t('limited-access')}</span>
                <small>{t('insight-locked')}</small>
            </div>
        </section>
    )
}
