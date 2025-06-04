import type { FunctionComponent } from 'react'

import { useTranslation, Trans } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { Link, H2, Text } from '@sourcegraph/wildcard'

import { InsightType } from '../../../../../core'
import { encodeCaptureInsightURL } from '../../../../insights/creation/capture-group'
import { encodeSearchInsightUrl } from '../../../../insights/creation/search-insight'

import { CodeInsightExampleCard } from './code-insight-example-card/CodeInsightExampleCard'
import { ALPINE_VERSIONS_INSIGHT, CSS_MODULES_VS_GLOBAL_STYLES_INSIGHT } from './examples'

import styles from './CodeInsightsExamples.module.scss'

export interface CodeInsightsExamplesProps
    extends TelemetryProps,
        TelemetryV2Props,
        React.HTMLAttributes<HTMLElement> {}

const SEARCH_INSIGHT_CREATION_UI_URL_PARAMETERS = encodeSearchInsightUrl({
    title: CSS_MODULES_VS_GLOBAL_STYLES_INSIGHT.title,
    // Convert chart-like series to the insight series model
    series: CSS_MODULES_VS_GLOBAL_STYLES_INSIGHT.series.map(series => ({ ...series, stroke: series.color })),
})

const CAPTURE_GROUP_INSIGHT_CREATION_UI_URL_PARAMETERS = encodeCaptureInsightURL({
    title: ALPINE_VERSIONS_INSIGHT.title,
    repoQuery: 'repo:.*',
    groupSearchQuery: ALPINE_VERSIONS_INSIGHT.groupSearch,
})

/**
 * Renders the code insights examples section. This is used for the on-prem and cloud
 * code insights landing pages.
 */
export const CodeInsightsExamples: FunctionComponent<CodeInsightsExamplesProps> = props => {
    const { t } = useTranslation('enterprise/insights/pages/landing/getting-started/components/code-insights-examples')

    const { telemetryService, telemetryRecorder, ...otherProps } = props
    const { pathname, search } = useLocation()

    return (
        <section {...otherProps}>
            <H2>{t('example-insights-title')}</H2>
            <Text className="text-muted">
                <Trans
                    i18nKey="example-insights-description"
                    components={{ '0': <Link to={`${pathname}${search}#code-insights-templates`} /> }}
                />
            </Text>

            <div className={styles.section}>
                <CodeInsightExampleCard
                    type={InsightType.SearchBased}
                    content={CSS_MODULES_VS_GLOBAL_STYLES_INSIGHT}
                    templateLink={`/insights/create/search?${SEARCH_INSIGHT_CREATION_UI_URL_PARAMETERS}`}
                    telemetryService={telemetryService}
                    telemetryRecorder={telemetryRecorder}
                    className={styles.card}
                />

                <CodeInsightExampleCard
                    type={InsightType.CaptureGroup}
                    content={ALPINE_VERSIONS_INSIGHT}
                    templateLink={`/insights/create/capture-group?${CAPTURE_GROUP_INSIGHT_CREATION_UI_URL_PARAMETERS}`}
                    telemetryService={telemetryService}
                    telemetryRecorder={telemetryRecorder}
                    className={styles.card}
                />
            </div>
        </section>
    )
}
