import React, { useEffect } from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { Card, Link, Text } from '@sourcegraph/wildcard'

import { AnalyticsPageTitle } from '../components/AnalyticsPageTitle'

interface Props extends TelemetryV2Props {}

export const AnalyticsCodyPage: React.FC<Props> = ({ telemetryRecorder }) => {
    const { t } = useTranslation('site-admin/analytics/AnalyticsCodyPage')

    useEffect(() => telemetryRecorder.recordEvent('admin.analytics.cody', 'view'), [telemetryRecorder])

    return (
        <>
            <AnalyticsPageTitle>{t('cody-name')}</AnalyticsPageTitle>

            <Card className="p-3">
                <Text>
                    <Trans
                        i18nKey="cody-analytics-info"
                        components={{
                            '0': <Link to="https://cody-analytics.sourcegraph.com" target="_blank" rel="noopener" />,
                        }}
                    />
                </Text>
                <Text>{t('request-access-contact')}</Text>
            </Card>
        </>
    )
}
