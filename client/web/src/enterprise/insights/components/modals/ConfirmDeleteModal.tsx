import React from 'react'

import { noop } from 'lodash'
import { useTranslation } from 'react-i18next'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { H3, Text } from '@sourcegraph/wildcard'

import type { Insight } from '../../core'
import { useDeleteInsight } from '../../hooks/use-delete-insight'

import { ConfirmationModal } from './ConfirmationModal'

type MinimalInsightFields = Pick<Insight, 'title' | 'id' | 'type'>

interface ConfirmDeleteModalProps extends TelemetryV2Props {
    insight: MinimalInsightFields
    showModal: boolean
    onCancel?: () => void
    onConfirm?: () => void
}

export const ConfirmDeleteModal: React.FunctionComponent<ConfirmDeleteModalProps> = ({
    insight,
    showModal,
    onCancel = noop,
    onConfirm = noop,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('enterprise/insights/components/modals')

    const { delete: handleDelete, loading } = useDeleteInsight(telemetryRecorder)

    const handleConfirm = async (): Promise<void> => {
        if (loading) {
            return
        }

        // TODO [VK] Handle error properly in this modal
        await handleDelete(insight)
        onConfirm()
    }

    return (
        <ConfirmationModal
            showModal={showModal}
            onCancel={onCancel}
            onConfirm={handleConfirm}
            ariaLabel="Delete insight modal"
            disabled={loading}
            variant="danger"
            confirmText="Delete forever"
        >
            <H3 className="text-danger mb-4">
                {t('delete-quote')}
                {insight.title}'?
            </H3>
            <Text className="mb-4">
                {t('confirm-delete-insight')}
                {insight.title}
                {t('delete-warning')}
            </Text>
        </ConfirmationModal>
    )
}
