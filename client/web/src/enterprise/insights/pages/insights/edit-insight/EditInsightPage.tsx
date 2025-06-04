import { type FC, useContext, useMemo } from 'react'

import MapSearchIcon from 'mdi-react/MapSearchIcon'
import { useTranslation, Trans } from 'react-i18next'
import { useParams } from 'react-router-dom'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { LoadingSpinner, useObservable, Link, PageHeader, Text } from '@sourcegraph/wildcard'

import { HeroPage } from '../../../../../components/HeroPage'
import { PageTitle } from '../../../../../components/PageTitle'
import { CodeInsightsIcon } from '../../../../../insights/Icons'
import { CodeInsightsPage } from '../../../components'
import {
    CodeInsightsBackendContext,
    isCaptureGroupInsight,
    isComputeInsight,
    isLangStatsInsight,
    isSearchBasedInsight,
} from '../../../core'
import { useUiFeatures } from '../../../hooks'

import { EditCaptureGroupInsight } from './components/EditCaptureGroupInsight'
import { EditComputeInsight } from './components/EditComputeInsight'
import { EditLangStatsInsight } from './components/EditLangStatsInsight'
import { EditSearchBasedInsight } from './components/EditSearchInsight'
import { useEditPageHandlers } from './hooks/use-edit-page-handlers'

interface EditInsightPageProps extends TelemetryV2Props {}

export const EditInsightPage: FC<EditInsightPageProps> = ({ telemetryRecorder }) => {
    const { t } = useTranslation('enterprise/insights/pages/insights/edit-insight')

    /** Normalized insight id <type insight>.insight.<name of insight> */
    const { insightId } = useParams()

    const { getInsightById } = useContext(CodeInsightsBackendContext)
    const { licensed, insight: insightFeatures } = useUiFeatures()

    const insight = useObservable(useMemo(() => getInsightById(insightId!), [getInsightById, insightId]))
    const { handleSubmit, handleCancel } = useEditPageHandlers({ id: insight?.id, telemetryRecorder })

    const editPermission = useObservable(
        useMemo(() => insightFeatures.getEditPermissions(insight), [insightFeatures, insight])
    )

    if (insight === undefined) {
        return <LoadingSpinner inline={false} />
    }

    if (!insight) {
        return <HeroPage icon={MapSearchIcon} title={t('oops-could-not-find-insight')} />
    }

    return (
        <CodeInsightsPage>
            <PageTitle title={t('edit-insight-code-insights')} />

            <PageHeader
                className="mb-3"
                path={[{ icon: CodeInsightsIcon, to: '/insights' }, { text: 'Edit insight' }]}
                description={
                    <Text className="text-muted">
                        <Trans
                            i18nKey="insights-analyze-code-learn-more"
                            components={{ '0': <Link to="/help/code_insights" target="_blank" rel="noopener" /> }}
                        />
                    </Text>
                }
            />

            {isSearchBasedInsight(insight) && (
                <EditSearchBasedInsight
                    licensed={licensed}
                    isEditAvailable={editPermission?.available}
                    insight={insight}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            )}

            {isCaptureGroupInsight(insight) && (
                <EditCaptureGroupInsight
                    licensed={licensed}
                    isEditAvailable={editPermission?.available}
                    insight={insight}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            )}

            {isLangStatsInsight(insight) && (
                <EditLangStatsInsight
                    licensed={licensed}
                    isEditAvailable={editPermission?.available}
                    insight={insight}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            )}

            {isComputeInsight(insight) && (
                <EditComputeInsight
                    licensed={licensed}
                    isEditAvailable={editPermission?.available}
                    insight={insight}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            )}
        </CodeInsightsPage>
    )
}
