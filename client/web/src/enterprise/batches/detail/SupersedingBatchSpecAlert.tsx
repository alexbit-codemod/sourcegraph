import React from 'react'

import { parseISO } from 'date-fns'
import { useTranslation, Trans } from 'react-i18next'

import { Timestamp } from '@sourcegraph/branded/src/components/Timestamp'
import { Link } from '@sourcegraph/wildcard'

import { DismissibleAlert } from '../../../components/DismissibleAlert'
import type { SupersedingBatchSpecFields } from '../../../graphql-operations'

export interface SupersedingBatchSpecAlertProps {
    spec: SupersedingBatchSpecFields | null
}

export const SupersedingBatchSpecAlert: React.FunctionComponent<
    React.PropsWithChildren<SupersedingBatchSpecAlertProps>
> = ({ spec }) => {
    const { t } = useTranslation('enterprise/batches/detail')

    if (!spec) {
        return <></>
    }

    const { applyURL, createdAt } = spec

    if (applyURL === null) {
        return null
    }

    return (
        <DismissibleAlert variant="info" partialStorageKey={`superseding-spec-${parseISO(spec.createdAt).getTime()}`}>
            <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                    <Trans i18nKey="modified-batch-spec-uploaded" components={{ '0': <Link to={applyURL} /> }} />
                    <Timestamp date={createdAt} noAbout={true} />
                    {t('batch-spec-not-applied')}
                </div>
            </div>
        </DismissibleAlert>
    )
}
