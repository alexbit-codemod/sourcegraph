import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'
import sinon from 'sinon'

import { H2 } from '@sourcegraph/wildcard'

import { WebStory } from '../../../../components/WebStory'
import { mockAuthenticatedUser } from '../../testing/util'
import type { ActionProps } from '../FormActionArea'

import { WebhookAction } from './WebhookAction'

const config: Meta = {
    title: 'web/enterprise/code-monitoring/actions/WebhookAction',
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

export default config

const defaultProps: ActionProps = {
    action: undefined,
    setAction: sinon.fake(),
    disabled: false,
    monitorName: 'Example code monitor',
    authenticatedUser: mockAuthenticatedUser,
}

const action: ActionProps['action'] = {
    __typename: 'MonitorWebhook',
    id: 'id1',
    url: 'https://example.com',
    enabled: true,
    includeResults: false,
}

export const WebhookActionStory: StoryFn = () => (
    <WebStory>
        {() => {
            const { t } = useTranslation('enterprise/code-monitoring/components/actions')

            return (
                <>
                    <H2>{t('action-card-disabled')}</H2>
                    <WebhookAction {...defaultProps} disabled={true} />

                    <H2>{t('closed-not-populated')}</H2>
                    <WebhookAction {...defaultProps} />

                    <H2>{t('open-not-populated')}</H2>
                    <WebhookAction {...defaultProps} _testStartOpen={true} />

                    <H2>{t('closed-populated-enabled')}</H2>
                    <WebhookAction {...defaultProps} action={action} />

                    <H2>{t('open-populated-enabled')}</H2>
                    <WebhookAction {...defaultProps} _testStartOpen={true} action={action} />

                    <H2>{t('open-populated-with-error-enabled')}</H2>
                    <WebhookAction {...defaultProps} _testStartOpen={true} action={{ ...action, url: 'mailto:test' }} />

                    <H2>{t('closed-populated-disabled')}</H2>
                    <WebhookAction {...defaultProps} action={{ ...action, enabled: false }} />

                    <H2>{t('open-populated-disabled')}</H2>
                    <WebhookAction {...defaultProps} _testStartOpen={true} action={{ ...action, enabled: false }} />
                </>
            )
        }}
    </WebStory>
)

WebhookActionStory.storyName = 'WebhookAction'
