import React from 'react'

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { H5 } from '@sourcegraph/wildcard'

import styles from './CodeMonitorLogsHeader.module.scss'

export const CodeMonitorLogsHeader: React.FunctionComponent<React.PropsWithChildren<{}>> = () => {
    const { t } = useTranslation('enterprise/code-monitoring/components/logs')

    return (
        <div className="d-flex align-items-center justify-content-between">
            <H5 as="div" aria-hidden={true} className={classNames(styles.nameColumn, 'text-uppercase text-nowrap')}>
                {t('monitor-name')}
            </H5>
            <H5 as="div" aria-hidden={true} className="text-uppercase text-nowrap">
                {t('last-run')}
            </H5>
        </div>
    )
}
