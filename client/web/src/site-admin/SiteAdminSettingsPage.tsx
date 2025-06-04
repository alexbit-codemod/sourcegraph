import * as React from 'react'

import { useTranslation } from 'react-i18next'

import type { PlatformContextProps } from '@sourcegraph/shared/src/platform/context'
import type { SettingsCascadeProps } from '@sourcegraph/shared/src/settings/settings'
import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { useIsLightTheme } from '@sourcegraph/shared/src/theme'
import { Text } from '@sourcegraph/wildcard'

import type { AuthenticatedUser } from '../auth'
import { PageTitle } from '../components/PageTitle'
import type { SiteResult } from '../graphql-operations'
import { SettingsArea } from '../settings/SettingsArea'

interface Props extends PlatformContextProps, SettingsCascadeProps, TelemetryProps, TelemetryV2Props {
    authenticatedUser: AuthenticatedUser
    site: Pick<SiteResult['site'], '__typename' | 'id'>
}

export const SiteAdminSettingsPage: React.FunctionComponent<React.PropsWithChildren<Props>> = props => {
    const { t } = useTranslation('site-admin')

    const isLightTheme = useIsLightTheme()

    return (
        <>
            <PageTitle title={t('global-settings-title')} />
            <SettingsArea
                {...props}
                isLightTheme={isLightTheme}
                subject={props.site}
                authenticatedUser={props.authenticatedUser}
                extraHeader={<Text>{t('global-settings-description')}</Text>}
            />
        </>
    )
}
