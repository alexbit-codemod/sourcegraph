import type { FunctionComponent } from 'react'

import { useTranslation } from 'react-i18next'

import { Timestamp } from '@sourcegraph/branded/src/components/Timestamp'

import type { PreciseIndexFields } from '../../../../graphql-operations'

export interface CodeIntelLastUpdatedProps {
    index: PreciseIndexFields
    now?: () => Date
}

export const PreciseIndexLastUpdated: FunctionComponent<CodeIntelLastUpdatedProps> = ({ index, now }) => {
    const { t } = useTranslation('enterprise/codeintel/indexes/components')

    return index.processingFinishedAt ? (
        <span>
            {t('completed-status')}
            <Timestamp date={index.processingFinishedAt} now={now} noAbout={true} />
        </span>
    ) : index.processingStartedAt ? (
        <span>
            {t('processing-started')}
            <Timestamp date={index.processingStartedAt} now={now} noAbout={true} />
        </span>
    ) : index.uploadedAt ? (
        <span>
            {t('uploaded-status')}
            <Timestamp date={index.uploadedAt} now={now} noAbout={true} />
        </span>
    ) : index.indexingFinishedAt ? (
        <span>
            {t('indexed-status')}
            <Timestamp date={index.indexingFinishedAt} now={now} noAbout={true} />
        </span>
    ) : index.indexingStartedAt ? (
        <span>
            {t('indexing-started')}
            <Timestamp date={index.indexingStartedAt} now={now} noAbout={true} />
        </span>
    ) : index.queuedAt ? (
        <span>
            {t('queued-status')}
            <Timestamp date={index.queuedAt} now={now} noAbout={true} />
        </span>
    ) : (
        <></>
    )
}
