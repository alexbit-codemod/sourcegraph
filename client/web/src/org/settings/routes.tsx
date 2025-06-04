import type { FC } from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { useIsLightTheme } from '@sourcegraph/shared/src/theme'
import { lazyComponent } from '@sourcegraph/shared/src/util/lazyComponent'
import { Text } from '@sourcegraph/wildcard'

import type { OrgExecutorSecretsListPageProps } from '../../enterprise/executors/secrets/ExecutorSecretsListPage'
import { SiteAdminAlert } from '../../site-admin/SiteAdminAlert'

import type { OrgSettingsAreaRoute, OrgSettingsAreaRouteContext } from './OrgSettingsArea'

const SettingsArea = lazyComponent(() => import('../../settings/SettingsArea'), 'SettingsArea')

const OrgExecutorSecretsListPage = lazyComponent<OrgExecutorSecretsListPageProps, 'OrgExecutorSecretsListPage'>(
    () => import('../../enterprise/executors/secrets/ExecutorSecretsListPage'),
    'OrgExecutorSecretsListPage'
)

export const orgSettingsAreaRoutes: readonly OrgSettingsAreaRoute[] = [
    {
        path: '',
        render: props => <SettingsAreaIndexPage {...props} />,
    },
    {
        path: 'profile',
        render: lazyComponent(() => import('./profile/OrgSettingsProfilePage'), 'OrgSettingsProfilePage'),
    },
    {
        path: 'members',
        render: lazyComponent(() => import('./members/OrgSettingsMembersPage'), 'OrgSettingsMembersPage'),
    },
    {
        path: '/executors/secrets',
        render: props => (
            <OrgExecutorSecretsListPage
                {...props}
                orgID={props.org.id}
                telemetryRecorder={props.platformContext.telemetryRecorder}
            />
        ),
        condition: ({ org: { viewerCanAdminister } }) =>
            viewerCanAdminister && window.context?.codeSearchEnabledOnInstance,
    },
]

interface SettingsAreaIndexPageProps extends OrgSettingsAreaRouteContext {}

const SettingsAreaIndexPage: FC<SettingsAreaIndexPageProps> = props => {
    const { t } = useTranslation('org/settings')

    const isLightTheme = useIsLightTheme()

    return (
        <div>
            <SettingsArea
                {...props}
                isLightTheme={isLightTheme}
                subject={props.org}
                extraHeader={
                    <>
                        {props.authenticatedUser && props.org.viewerCanAdminister && !props.org.viewerIsMember && (
                            <SiteAdminAlert className="sidebar__alert">
                                <Trans
                                    i18nKey="viewing-settings-org-name"
                                    values={{ propsOrgName: <>{props.org.name}</> }}
                                    components={{ '0': <strong /> }}
                                />
                            </SiteAdminAlert>
                        )}
                        <Text>{t('org-settings-apply-to-members')}</Text>
                    </>
                }
            />
        </div>
    )
}
