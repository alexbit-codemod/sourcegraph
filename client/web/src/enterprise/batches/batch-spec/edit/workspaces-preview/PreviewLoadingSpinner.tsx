import React from 'react'

import { useTranslation } from 'react-i18next'

export const PreviewLoadingSpinner: React.FunctionComponent<{
    className?: string
}> = ({ className }) => {
    const { t } = useTranslation('enterprise/batches/batch-spec/edit/workspaces-preview')

    const svgSource = `${window.context?.assetsRoot || ''}/img/batchchanges-preview-loading.svg`

    return <img src={svgSource} className={className} height="50" width="50" alt={t('workspaces-preview-loading')} />
}
