import { type FC, useEffect } from 'react'

import { mdiWebhook } from '@mdi/js'
import { useTranslation } from 'react-i18next'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { PageHeader } from '@sourcegraph/wildcard'

import { PageTitle } from '../components/PageTitle'

import { WebhookCreateUpdatePage } from './WebhookCreateUpdatePage'

export interface SiteAdminWebhookCreatePageProps extends TelemetryProps, TelemetryV2Props {}

export const SiteAdminWebhookCreatePage: FC<SiteAdminWebhookCreatePageProps> = ({
    telemetryService,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('site-admin')

    useEffect(() => {
        telemetryService.logPageView('SiteAdminWebhookCreatePage')
        telemetryRecorder.recordEvent('admin.webhook.create', 'view')
    }, [telemetryService, telemetryRecorder])

    return (
        <>
            <PageTitle title={t('create-incoming-webhook')} />
            <PageHeader
                path={[
                    { icon: mdiWebhook },
                    { to: '/site-admin/webhooks/incoming', text: 'Incoming webhooks' },
                    { text: 'Create' },
                ]}
                headingElement="h2"
                description={t('create-new-incoming-webhook')}
                className="mb-3"
            />
            <WebhookCreateUpdatePage />
        </>
    )
}
