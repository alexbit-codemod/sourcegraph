import React from 'react'

import { useTranslation } from 'react-i18next'

import { Button, Tooltip } from '@sourcegraph/wildcard'

export interface ConfigurationInferButtonProps {
    onClick?: () => void
}

export const ConfigurationInferButton: React.FunctionComponent<ConfigurationInferButtonProps> = ({ onClick }) => {
    const { t } = useTranslation('enterprise/codeintel/configuration/components')

    return (
        <Tooltip content="Infer index configuration from HEAD">
            <Button type="button" variant="secondary" outline={true} className="ml-2" onClick={onClick}>
                {t('infer-configuration')}
            </Button>
        </Tooltip>
    )
}
