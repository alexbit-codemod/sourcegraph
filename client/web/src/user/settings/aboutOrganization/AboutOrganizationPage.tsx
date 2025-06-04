import React, { useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { PageHeader, Text } from '@sourcegraph/wildcard'

import { PageTitle } from '../../../components/PageTitle'
import { SelfHostedCta } from '../../../components/SelfHostedCta'

import styles from './AboutOrganizationPage.module.scss'

interface AboutOrganizationPageProps extends TelemetryProps, TelemetryV2Props {}

export const AboutOrganizationPage: React.FunctionComponent<React.PropsWithChildren<AboutOrganizationPageProps>> = ({
    telemetryService,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('user/settings/aboutOrganization')

    useEffect(() => {
        telemetryService.logViewEvent('AboutOrg')
        telemetryRecorder.recordEvent('settings.aboutOrganizations', 'view')
    }, [telemetryService, telemetryRecorder])

    return (
        <>
            <PageTitle title={t('organizations-title')} />
            <PageHeader
                headingElement="h2"
                path={[{ text: 'Organizations' }]}
                description={t('support-for-organizations-unavailable')}
                className="mb-3"
            />
            <SelfHostedCta
                contentClassName={styles.selfHostedCtaContent}
                page="organizations"
                telemetryService={telemetryService}
                telemetryRecorder={telemetryRecorder}
            >
                <Text className="mb-2">
                    <strong>{t('need-more-enterprise-features')}</strong>
                </Text>
                <Text className="mb-2">{t('additional-code-hosts-enterprise-features')}</Text>
            </SelfHostedCta>
        </>
    )
}
