import React, { useMemo } from 'react'

import { useTranslation } from 'react-i18next'

import { pluralize } from '@sourcegraph/common'
import { AlertLink, Alert } from '@sourcegraph/wildcard'

import { BatchSpecState } from '../../../graphql-operations'

interface ActiveExecutionNoticeProps {
    batchSpecs: { state: BatchSpecState }[]
    batchChangeURL: string
    className?: string
}

export const ActiveExecutionNotice: React.FunctionComponent<React.PropsWithChildren<ActiveExecutionNoticeProps>> = ({
    batchSpecs,
    batchChangeURL,
    className,
}) => {
    const { t } = useTranslation('enterprise/batches/detail')

    const numberExecuting = useMemo(
        () =>
            batchSpecs.filter(({ state }) => state === BatchSpecState.PROCESSING || state === BatchSpecState.QUEUED)
                .length,
        [batchSpecs]
    )

    if (!numberExecuting) {
        return null
    }

    return (
        <Alert className={className} variant="waiting">
            {t('there')}
            {pluralize('is', numberExecuting, 'are')}
            {t('current-batch-executing', { numberExecuting })}
            {pluralize('spec', numberExecuting)}{' '}
            <AlertLink to={`${batchChangeURL}/executions`}>{t('executing-status')}</AlertLink>.
        </Alert>
    )
}
