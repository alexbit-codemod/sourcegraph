import React from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { TemplateBanner } from './TemplateBanner'

interface InsightTemplatesBannerProps {
    insightTitle: string
    type: 'create' | 'edit'
    className?: string
}

export const InsightTemplatesBanner: React.FunctionComponent<React.PropsWithChildren<InsightTemplatesBannerProps>> = ({
    insightTitle,
    type,
    className,
}) => {
    const { t } = useTranslation('enterprise/batches/create')

    const [heading, description]: [React.ReactNode, React.ReactNode] =
        type === 'create'
            ? [
                  'You are creating a batch change from a code insight',
                  <>
                      <Trans
                          i18nKey="let-sourcegraph-help-with-batch-change"
                          values={{ insightTitle: <>{insightTitle}</> }}
                          components={{ '0': <strong />, '1': <strong /> }}
                      />
                  </>,
              ]
            : [
                  `Start from template for the ${insightTitle}`,
                  `Sourcegraph pre-selected a batch spec for the batch change started from ${insightTitle}.`,
              ]

    return <TemplateBanner heading={heading} description={description} className={className} />
}
