import React from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { H3, Text } from '@sourcegraph/wildcard'

import type { Insight, InsightDashboard } from '../../../../core'
import { useRemoveInsightFromDashboard } from '../../../../hooks/use-remove-insight'
import { ConfirmationModal, type ConfirmationModalProps } from '../../../modals/ConfirmationModal'

interface ConfirmRemoveModalProps extends TelemetryV2Props, Pick<ConfirmationModalProps, 'showModal' | 'onCancel'> {
    insight: Insight
    dashboard: InsightDashboard | null
}

export const ConfirmRemoveModal: React.FunctionComponent<React.PropsWithChildren<ConfirmRemoveModalProps>> = ({
    insight,
    dashboard,
    showModal,
    onCancel,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('enterprise/insights/components/insights-view-grid/components/insight-context-menu')

    const { remove, loading } = useRemoveInsightFromDashboard(telemetryRecorder)

    return (
        <ConfirmationModal
            showModal={showModal}
            onCancel={onCancel}
            onConfirm={() => dashboard && !loading && remove({ insight, dashboard })}
            ariaLabel="Remove insight modal"
            disabled={loading}
            variant="danger"
        >
            <H3 className="text-danger mb-4">{t('remove-insight-confirmation')}</H3>
            <Text className="mb-4">
                <Trans
                    i18nKey="remove-insight-dashboard-confirmation"
                    values={{ insightTitle: <>{insight.title}</>, dashboardTitle: <>{dashboard?.title}</> }}
                    components={{ '0': <strong />, '1': <strong /> }}
                />
            </Text>
        </ConfirmationModal>
    )
}
