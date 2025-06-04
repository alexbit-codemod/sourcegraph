import React from 'react'

import { useTranslation } from 'react-i18next'

import { pluralize } from '@sourcegraph/common'
import { AlertLink, Alert } from '@sourcegraph/wildcard'

interface UnpublishedNoticeProps {
    unpublished: number
    total: number
    className?: string
}

export const UnpublishedNotice: React.FunctionComponent<React.PropsWithChildren<UnpublishedNoticeProps>> = ({
    unpublished,
    total,
    className,
}) => {
    const { t } = useTranslation('enterprise/batches/detail')

    if (total === 0 || unpublished !== total) {
        return <></>
    }
    return (
        <Alert className={className} variant="secondary">
            {t('unpublished-status', { unpublished })}
            {pluralize('changeset', unpublished, 'changesets')}
            {t('select-changesets-publish-action')}
            <AlertLink
                to="/help/batch_changes/how-tos/publishing_changesets#publishing-changesets"
                rel="noopener"
                target="_blank"
            >
                {t('read-more-publishing-changesets')}
            </AlertLink>
            .
        </Alert>
    )
}
