import React, { useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'

import { PageTitle } from '../../../../../components/PageTitle'

import { CodeInsightsExamples } from './components/code-insights-examples/CodeInsightsExamples'
import { CodeInsightsTemplates } from './components/code-insights-templates/CodeInsightsTemplates'
import { DynamicCodeInsightExample } from './components/dynamic-code-insight-example/DynamicCodeInsightExample'

import styles from './CodeInsightsGettingStartedPage.module.scss'

interface CodeInsightsGettingStartedPageProps extends TelemetryProps, TelemetryV2Props {}

export const CodeInsightsGettingStartedPage: React.FunctionComponent<
    React.PropsWithChildren<CodeInsightsGettingStartedPageProps>
> = props => {
    const { t } = useTranslation('enterprise/insights/pages/landing/getting-started')

    const { telemetryService, telemetryRecorder } = props

    useEffect(() => {
        telemetryService.logViewEvent('InsightsGetStartedPage')
        telemetryRecorder.recordEvent('insights.getStarted', 'view')
    }, [telemetryService, telemetryRecorder])

    return (
        <main className="pb-5">
            <PageTitle title={t('code-insights')} />
            <DynamicCodeInsightExample telemetryService={telemetryService} telemetryRecorder={telemetryRecorder} />
            <CodeInsightsExamples
                telemetryService={telemetryService}
                telemetryRecorder={telemetryRecorder}
                className={styles.section}
            />
            <CodeInsightsTemplates
                telemetryService={telemetryService}
                telemetryRecorder={telemetryRecorder}
                className={styles.section}
            />
        </main>
    )
}
