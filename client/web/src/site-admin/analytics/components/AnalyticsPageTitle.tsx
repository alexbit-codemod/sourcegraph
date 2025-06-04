import React from 'react'

import { mdiChartLineVariant } from '@mdi/js'
import { useTranslation } from 'react-i18next'

import { SiteAdminPageTitle } from '../../components/SiteAdminPageTitle'

export const AnalyticsPageTitle: React.FunctionComponent<React.PropsWithChildren<{}>> = ({ children }) => {
    const { t } = useTranslation('site-admin/analytics/components')

    return <SiteAdminPageTitle icon={mdiChartLineVariant}>{t('analytics-children', { children })}</SiteAdminPageTitle>
}
