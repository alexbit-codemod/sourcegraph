import React from 'react'

import { useTranslation } from 'react-i18next'

import { Alert } from '@sourcegraph/wildcard'

import type { BatchChangeFields } from '../../../graphql-operations'

interface ClosedNoticeProps {
    closedAt: BatchChangeFields['closedAt']
    className?: string
}

export const ClosedNotice: React.FunctionComponent<React.PropsWithChildren<ClosedNoticeProps>> = ({
    closedAt,
    className,
}) => {
    const { t } = useTranslation('enterprise/batches/detail')

    if (!closedAt) {
        return null
    }

    return (
        <Alert className={className} variant="info">
            {t('information-page-out-of-date')}
        </Alert>
    )
}
