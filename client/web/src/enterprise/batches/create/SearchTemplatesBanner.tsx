import React from 'react'

import { useTranslation } from 'react-i18next'

import { TemplateBanner } from './TemplateBanner'

interface SearchTemplatesBannerProps {
    className?: string
}

export const SearchTemplatesBanner: React.FunctionComponent<SearchTemplatesBannerProps> = ({ className }) => {
    const { t } = useTranslation('enterprise/batches/create')

    return (
        <TemplateBanner
            heading="You are creating a batch change from a code search"
            description={t('sourcegraph-refactor-batch-change')}
            className={className}
        />
    )
}
