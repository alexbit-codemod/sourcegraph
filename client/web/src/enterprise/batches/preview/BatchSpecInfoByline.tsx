import React from 'react'

import { useTranslation } from 'react-i18next'

import { Timestamp } from '@sourcegraph/branded/src/components/Timestamp'
import { Link } from '@sourcegraph/wildcard'

import type { BatchSpecFields } from '../../../graphql-operations'

interface Props extends Pick<BatchSpecFields, 'createdAt' | 'creator'> {}

/**
 * The uploaded at byline to the batch change apply page header.
 */
export const BatchSpecInfoByline: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    createdAt,
    creator,
}) => {
    const { t } = useTranslation('enterprise/batches/preview')

    return (
        <>
            {t('uploaded-message')}
            <Timestamp date={createdAt} />
            {t('by-separator')}
            {creator && <Link to={creator.url}>{creator.username}</Link>}
            {!creator && <strong>{t('deleted-user')}</strong>}
        </>
    )
}
