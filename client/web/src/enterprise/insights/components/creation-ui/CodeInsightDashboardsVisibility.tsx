import React from 'react'

import { useTranslation } from 'react-i18next'

import { Alert, H4 } from '@sourcegraph/wildcard'

export interface CodeInsightDashboardsVisibilityProps extends React.HTMLAttributes<HTMLDivElement> {
    dashboardCount: number
}

export const CodeInsightDashboardsVisibility: React.FunctionComponent<
    React.PropsWithChildren<CodeInsightDashboardsVisibilityProps>
> = props => {
    const { t } = useTranslation('enterprise/insights/components/creation-ui')

    const { dashboardCount, ...attributes } = props

    return (
        <Alert variant="note" {...attributes}>
            <H4 className="mt-0">{t('insight-included-in-other-dashboards', { dashboardCount })}</H4>
            <span className="text-muted">{t('changes-shared-across-instances')}</span>
        </Alert>
    )
}
