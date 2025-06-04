import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'
import sinon from 'sinon'

import { H2 } from '@sourcegraph/wildcard'

import { WebStory } from '../../../../components/WebStory'
import { mockAuthenticatedUser } from '../../testing/util'
import type { ActionProps } from '../FormActionArea'

import { SlackWebhookAction } from './SlackWebhookAction'

const config: Meta = {
    title: 'web/enterprise/code-monitoring/actions/SlackWebhookAction',
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
    __typename: 'MonitorSlackWebhook',
    id: 'id1',
    url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
    enabled: true,
    includeResults: false,
}

export const SlackWebhookActionStory: StoryFn = () => (
    <WebStory>
        {() => {
            const { t } = useTranslation('enterprise/code-monitoring/components/actions')

            return (
                <>
                    <H2>{t('action-card-disabled')}</H2>
                    <SlackWebhookAction {...defaultProps} disabled={true} />

                    <H2>{t('closed-not-populated')}</H2>
                    <SlackWebhookAction {...defaultProps} />

                    <H2>{t('open-not-populated')}</H2>
                    <SlackWebhookAction {...defaultProps} _testStartOpen={true} />

                    <H2>{t('closed-populated-enabled')}</H2>
                    <SlackWebhookAction {...defaultProps} action={action} />

                    <H2>{t('open-populated-enabled')}</H2>
                    <SlackWebhookAction {...defaultProps} _testStartOpen={true} action={action} />

                    <H2>{t('open-populated-with-error-enabled')}</H2>
                    <SlackWebhookAction
                        {...defaultProps}
                        _testStartOpen={true}
                        action={{ ...action, url: 'https://example.com' }}
                    />

                    <H2>{t('closed-populated-disabled')}</H2>
                    <SlackWebhookAction {...defaultProps} action={{ ...action, enabled: false }} />

                    <H2>{t('open-populated-disabled')}</H2>
                    <SlackWebhookAction
                        {...defaultProps}
                        _testStartOpen={true}
                        action={{ ...action, enabled: false }}
                    />
                </>
            )
        }}
    </WebStory>
)

SlackWebhookActionStory.storyName = 'SlackWebhookAction'
