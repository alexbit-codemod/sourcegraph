import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { Code, Grid } from '@sourcegraph/wildcard'

import { WebStory } from '../../components/WebStory'
import { siteAdminSidebarGroups } from '../../site-admin/sidebaritems'
import { SiteAdminSidebar } from '../../site-admin/SiteAdminSidebar'

const decorator: Decorator = story => <div style={{ width: '192px' }}>{story()}</div>

const config: Meta = {
    title: 'web/site-admin/AdminSidebar',
    decorators: [decorator],
    parameters: {
        chromatic: {
            disableSnapshot: false,
        },
    },
}

export default config

// Moved story under enterprise folder to avoid failing ci linting
// due to importing enterprise path in oss folders.
export const AdminSidebarItems: StoryFn = () => (
    <WebStory>
        {webProps => {
            const { t } = useTranslation('enterprise/site-admin')

            return (
                <Grid columnCount={5}>
                    <Code>{t('default-message')}</Code>
                    <Code>{t('sourcegraph-com-flag-true')}</Code>
                    <Code>{t('batch-changes-enabled-false')}</Code>
                    <Code>{t('code-insights-enabled-false')}</Code>
                    <SiteAdminSidebar
                        {...webProps}
                        groups={siteAdminSidebarGroups}
                        isSourcegraphDotCom={false}
                        batchChangesEnabled={true}
                        batchChangesExecutionEnabled={true}
                        batchChangesWebhookLogsEnabled={true}
                        codeInsightsEnabled={true}
                        endUserOnboardingEnabled={false}
                    />
                    <SiteAdminSidebar
                        {...webProps}
                        groups={siteAdminSidebarGroups}
                        isSourcegraphDotCom={true}
                        batchChangesEnabled={true}
                        batchChangesExecutionEnabled={true}
                        batchChangesWebhookLogsEnabled={true}
                        codeInsightsEnabled={true}
                        endUserOnboardingEnabled={false}
                    />
                    <SiteAdminSidebar
                        {...webProps}
                        groups={siteAdminSidebarGroups}
                        isSourcegraphDotCom={false}
                        batchChangesEnabled={false}
                        batchChangesExecutionEnabled={false}
                        batchChangesWebhookLogsEnabled={false}
                        codeInsightsEnabled={true}
                        endUserOnboardingEnabled={false}
                    />
                    <SiteAdminSidebar
                        {...webProps}
                        groups={siteAdminSidebarGroups}
                        isSourcegraphDotCom={false}
                        batchChangesEnabled={true}
                        batchChangesExecutionEnabled={true}
                        batchChangesWebhookLogsEnabled={true}
                        codeInsightsEnabled={false}
                        endUserOnboardingEnabled={false}
                    />
                </Grid>
            )
        }}
    </WebStory>
)

AdminSidebarItems.storyName = 'Admin Sidebar Items'
AdminSidebarItems.parameters = {
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/cT23UcGqbdjdV4H2yxweIu/%2311775-Map-the-current-information-architecture-%5BApproved%5D?node-id=68%3A1',
    },
}
