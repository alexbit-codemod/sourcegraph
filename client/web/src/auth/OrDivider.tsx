import React from 'react'

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import styles from './OrDivider.module.scss'

interface Props {
    className?: string
}

export const OrDivider: React.FunctionComponent<React.PropsWithChildren<Props>> = ({ className }) => {
    const { t } = useTranslation('auth')

    return (
        <div className={classNames(className, 'd-flex align-items-center')}>
            <div className={classNames('w-100', styles.border)} />
            <small className="px-2 text-muted ">{t('or-operator')}</small>
            <div className={classNames('w-100', styles.border)} />
        </div>
    )
}
