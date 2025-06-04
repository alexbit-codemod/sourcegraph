import React, { useCallback } from 'react'

import { mdiAlertCircle } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { useQuery } from '@sourcegraph/http-client'
import { Button, Icon } from '@sourcegraph/wildcard'

import type { WebhookLogPageHeaderResult } from '../../graphql-operations'

import { WEBHOOK_LOG_PAGE_HEADER } from './backend'
import { PerformanceGauge } from './PerformanceGauge'

import styles from './WebhookLogPageHeader.module.scss'

export interface Props {
    onlyErrors: boolean
    onSetOnlyErrors: (onlyErrors: boolean) => void
}

export const WebhookLogPageHeader: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    onlyErrors,
    onSetOnlyErrors: onSetErrors,
}) => {
    const { t } = useTranslation('site-admin/webhooks')

    const onErrorToggle = useCallback(() => onSetErrors(!onlyErrors), [onlyErrors, onSetErrors])

    const { data } = useQuery<WebhookLogPageHeaderResult>(WEBHOOK_LOG_PAGE_HEADER, {})
    const errorCount = data?.webhookLogs.totalCount ?? 0

    return (
        <div className={styles.grid}>
            <div className={styles.errors}>
                <PerformanceGauge
                    count={data?.webhookLogs.totalCount}
                    countClassName={errorCount > 0 ? 'text-danger' : undefined}
                    label={t('recent-error')}
                />
            </div>
            <div className={styles.services}>
                <PerformanceGauge count={data?.externalServices.totalCount} label={t('external-service')} />
            </div>
            <div className={styles.errorButton}>
                <Button variant="danger" onClick={onErrorToggle} outline={!onlyErrors}>
                    <Icon
                        className={classNames(styles.icon, onlyErrors && styles.enabled)}
                        aria-hidden={true}
                        svgPath={mdiAlertCircle}
                    />
                    <span className="ml-1">{t('only-errors')}</span>
                </Button>
            </div>
        </div>
    )
}
