import React, { useEffect } from 'react'

import { mdiWebhook, mdiMapSearch, mdiPlus } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { ButtonLink, Container, Icon, PageHeader } from '@sourcegraph/wildcard'

import {
    ConnectionContainer,
    ConnectionError,
    ConnectionList,
    ConnectionLoading,
    ConnectionSummary,
    ShowMoreButton,
    SummaryContainer,
} from '../components/FilteredConnection/ui'
import { PageTitle } from '../components/PageTitle'

import { useWebhooksConnection, useWebhookPageHeader } from './backend'
import { WebhookNode } from './WebhookNode'
import { PerformanceGauge } from './webhooks/PerformanceGauge'

import styles from './SiteAdminWebhooksPage.module.scss'

interface Props extends TelemetryProps, TelemetryV2Props {}

export const SiteAdminWebhooksPage: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    telemetryService,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('site-admin')

    useEffect(() => {
        telemetryService.logPageView('SiteAdminWebhooks')
        telemetryRecorder.recordEvent('admin.webhooks', 'view')
    }, [telemetryService, telemetryRecorder])

    const { loading, hasNextPage, fetchMore, connection, refetchAll: refetchList, error } = useWebhooksConnection()
    const headerTotals = useWebhookPageHeader()
    return (
        <div className="site-admin-webhooks-page">
            <PageTitle title={t('incoming-webhooks-title')} />
            <PageHeader
                path={[{ icon: mdiWebhook }, { to: '/site-admin/webhooks/incoming', text: 'Incoming webhooks' }]}
                headingElement="h2"
                description={t('incoming-webhooks-description')}
                className="mb-3"
                actions={
                    <ButtonLink
                        to="/site-admin/webhooks/incoming/create"
                        className="test-create-webhook"
                        variant="primary"
                    >
                        <Icon aria-hidden={true} svgPath={mdiPlus} />
                        {t('create-webhook-action')}
                    </ButtonLink>
                }
            />

            <Container>
                {!headerTotals.loading && (
                    <div className={classNames(styles.grid, 'mb-3')}>
                        <PerformanceGauge
                            count={headerTotals.totalErrors}
                            countClassName={headerTotals.totalErrors > 0 ? 'text-danger' : ''}
                            label={t('error-message')}
                        />
                        <PerformanceGauge
                            count={headerTotals.totalNoEvents}
                            countClassName={headerTotals.totalNoEvents > 0 ? 'text-warning' : ''}
                            label={t('no-event-message')}
                        />
                    </div>
                )}
                <ConnectionContainer>
                    {error && <ConnectionError errors={[error.message]} />}
                    {loading && !connection && <ConnectionLoading />}
                    <ConnectionList as="ul" className="list-group" aria-label="Webhooks">
                        {connection?.nodes?.map((node, index) => (
                            <WebhookNode
                                key={node.id}
                                webhook={node}
                                afterDelete={refetchList}
                                first={index === 0}
                                telemetryRecorder={telemetryRecorder}
                            />
                        ))}
                    </ConnectionList>
                    {connection && (
                        <SummaryContainer className="mt-2" centered={true}>
                            <ConnectionSummary
                                noSummaryIfAllNodesVisible={false}
                                first={connection.totalCount ?? 0}
                                centered={true}
                                connection={connection}
                                noun="webhook"
                                pluralNoun="webhooks"
                                hasNextPage={hasNextPage}
                                emptyElement={<EmptyList />}
                            />
                            {hasNextPage && <ShowMoreButton centered={true} onClick={fetchMore} />}
                        </SummaryContainer>
                    )}
                </ConnectionContainer>
            </Container>
        </div>
    )
}

const EmptyList: React.FunctionComponent<React.PropsWithChildren<{}>> = () => {
    const { t } = useTranslation('site-admin')

    return (
        <div className="text-muted text-center mb-3 w-100">
            <Icon className="icon" svgPath={mdiMapSearch} inline={false} aria-hidden={true} />
            <div className="pt-2">{t('no-webhooks-created-message')}</div>
        </div>
    )
}
