import React from 'react'

import { useTranslation } from 'react-i18next'

import { H3, Text } from '@sourcegraph/wildcard'

import { defaultExternalServices } from '../../../components/externalServices/externalServices'
import type { ExternalServiceKind } from '../../../graphql-operations'

export interface ModalHeaderProps {
    id: string
    externalServiceKind: ExternalServiceKind
    externalServiceURL: string
}

export const ModalHeader: React.FunctionComponent<React.PropsWithChildren<ModalHeaderProps>> = ({
    id,
    externalServiceKind,
    externalServiceURL,
}) => {
    const { t } = useTranslation('enterprise/batches/settings')

    return (
        <>
            <H3 id={id}>
                {t('batch-changes-credentials')}
                {defaultExternalServices[externalServiceKind].defaultDisplayName}
            </H3>
            <Text className="mb-4">{externalServiceURL}</Text>
        </>
    )
}
