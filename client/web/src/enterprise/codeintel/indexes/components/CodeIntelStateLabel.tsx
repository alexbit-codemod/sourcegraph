import type { FunctionComponent } from 'react'

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { PreciseIndexState } from '../../../../graphql-operations'

export interface CodeIntelStateLabelProps {
    state: PreciseIndexState
    autoIndexed: boolean
    placeInQueue?: number | null
    className?: string
}

const labelClassName = 'text-muted text-center'

export const CodeIntelStateLabel: FunctionComponent<CodeIntelStateLabelProps> = ({
    state,
    autoIndexed,
    placeInQueue,
    className,
}) => {
    const { t } = useTranslation('enterprise/codeintel/indexes/components')

    return state === PreciseIndexState.QUEUED_FOR_PROCESSING || state === PreciseIndexState.QUEUED_FOR_INDEXING ? (
        <span className={classNames(labelClassName, className)}>
            {t('queued-status')}
            {placeInQueue ? <span className="d-block">(#{placeInQueue})</span> : <></>}
        </span>
    ) : state === PreciseIndexState.PROCESSING ? (
        <span className={classNames(labelClassName, className)}>{t('processing-status')}</span>
    ) : state === PreciseIndexState.PROCESSING_ERRORED ? (
        <span className={classNames(labelClassName, className)}>{t('errored-status')}</span>
    ) : state === PreciseIndexState.COMPLETED ? (
        <span className={classNames(labelClassName, className)}>{t('completed-status')}</span>
    ) : state === PreciseIndexState.DELETED ? (
        <span className={classNames(labelClassName, className)}>{t('deleted-status')}</span>
    ) : state === PreciseIndexState.DELETING ? (
        <span className={classNames(labelClassName, className)}>{t('deleting-status')}</span>
    ) : state === PreciseIndexState.UPLOADING_INDEX ? (
        <span className={classNames(labelClassName, className)}>{t('uploading-status')}</span>
    ) : state === PreciseIndexState.INDEXING ? (
        <span className={classNames(labelClassName, className)}>{t('indexing-status')}</span>
    ) : state === PreciseIndexState.INDEXING_ERRORED ? (
        <span className={classNames(labelClassName, className)}>{t('errored-status-duplicate')}</span>
    ) : state === PreciseIndexState.INDEXING_COMPLETED ? (
        <span className={classNames(labelClassName, className)}>{t('completed-status-lowercase')}</span>
    ) : autoIndexed ? (
        <span className={classNames(labelClassName, className)}>{t('completed-status-duplicate')}</span>
    ) : (
        <></>
    )
}
