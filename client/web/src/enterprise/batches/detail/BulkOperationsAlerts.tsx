import React from 'react'

import { useTranslation, Trans } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { pluralize } from '@sourcegraph/common'
import { BulkOperationState } from '@sourcegraph/shared/src/graphql-operations'
import { Link } from '@sourcegraph/wildcard'

import { DismissibleAlert, isAlertDismissed } from '../../../components/DismissibleAlert'
import type { ActiveBulkOperationsConnectionFields } from '../../../graphql-operations'

import { TabName } from './BatchChangeDetailsTabs'

export interface BulkOperationsAlertsProps {
    bulkOperations: ActiveBulkOperationsConnectionFields
}

/**
 * Renders the alert bar at the top of the BatchChangeDetailsPage, when a bulk operation recently changed state or is processing.
 * The logic for this is rather complex (TODO). It takes a list of bulk operations, which returns at most the latest 50 entries and
 * only entries that were created less than three days ago.
 * If there are any processing operations in that list, and the alerts have not been dismissed yet, a "in progress" alert is shown.
 * If not, and there are failed bulk operations in the list and the alert for that hasn't been dismissed yet, a "something failed"
 * alert is shown.
 * If neither of the two above, and at least one completed operation is in the list and the alert has not yet been dismissed, a
 * "something recently completed" alert is shown.
 */
export const BulkOperationsAlerts: React.FunctionComponent<React.PropsWithChildren<BulkOperationsAlertsProps>> = ({
    bulkOperations,
}) => {
    const { t } = useTranslation('enterprise/batches/detail')

    // Don't show the header banners if the bulkoperations tab is open.
    const location = useLocation()
    const parameters = new URLSearchParams(location.search)
    if (parameters.get('tab') === TabName.BulkOperations) {
        return null
    }

    const latestProcessingNode = bulkOperations.nodes.find(node => node.state === BulkOperationState.PROCESSING)
    if (latestProcessingNode && !isAlertDismissed(`bulkOperation-processing-${latestProcessingNode.id}`)) {
        const processingCount = bulkOperations.nodes.filter(node => node.state === BulkOperationState.PROCESSING).length
        return (
            <DismissibleAlert variant="info" partialStorageKey={`bulkOperation-processing-${latestProcessingNode.id}`}>
                <span>
                    {t('bulk-processing-count', { processingCount })}
                    {pluralize('operation', processingCount)} {pluralize('is', processingCount, 'are')}
                    <Trans
                        i18nKey="bulk-operations-running-info"
                        components={{ '0': <Link to="?tab=bulkoperations" /> }}
                    />
                </span>
            </DismissibleAlert>
        )
    }

    const latestFailedNode = bulkOperations.nodes.find(node => node.state === BulkOperationState.FAILED)
    if (latestFailedNode && !isAlertDismissed(`bulkOperation-failed-${latestFailedNode.id}`)) {
        const failedCount = bulkOperations.nodes.filter(node => node.state === BulkOperationState.FAILED).length
        return (
            <DismissibleAlert variant="info" partialStorageKey={`bulkOperation-failed-${latestFailedNode.id}`}>
                <span>
                    {t('bulk-failed-count', { failedCount })}
                    {pluralize('operation', failedCount)} {pluralize('has', failedCount, 'have')}
                    <Trans
                        i18nKey="bulk-operations-failed-info"
                        components={{ '0': <Link to="?tab=bulkoperations" /> }}
                    />
                </span>
            </DismissibleAlert>
        )
    }
    const latestCompleteNode = bulkOperations.nodes.find(node => node.state === BulkOperationState.COMPLETED)
    if (latestCompleteNode && !isAlertDismissed(`bulkOperation-completed-${latestCompleteNode.id}`)) {
        const completeCount = bulkOperations.nodes.filter(node => node.state === BulkOperationState.COMPLETED).length
        return (
            <DismissibleAlert variant="info" partialStorageKey={`bulkOperation-completed-${latestCompleteNode.id}`}>
                <span>
                    {t('bulk-complete-count', { completeCount })}
                    {pluralize('operation', completeCount)} {pluralize('has', completeCount, 'have')}
                    <Trans
                        i18nKey="bulk-operations-finished-info"
                        components={{ '0': <Link to="?tab=bulkoperations" /> }}
                    />
                </span>
            </DismissibleAlert>
        )
    }
    return null
}
