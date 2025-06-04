import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'
import sinon from 'sinon'

import { H2 } from '@sourcegraph/wildcard'

import { WebStory } from '../../../../components/WebStory'
import { mockAuthenticatedUser } from '../../testing/util'
import type { ActionProps } from '../FormActionArea'

import { EmailAction } from './EmailAction'

const config: Meta = {
    title: 'web/enterprise/code-monitoring/actions/EmailAction',
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

export default config

const defaultProps: ActionProps = {
    action: undefined,
    setAction: sinon.fake(),
    disabled: false,
    authenticatedUser: mockAuthenticatedUser,
    monitorName: 'Example code monitor',
}

const action: ActionProps['action'] = {
    __typename: 'MonitorEmail',
    id: 'id1',
    recipients: { nodes: [{ id: 'userID' }] },
    enabled: true,
    includeResults: false,
}
window.context.emailEnabled = true

export const EmailActionStory: StoryFn = () => (
    <WebStory>
        {() => {
            const { t } = useTranslation('enterprise/code-monitoring/components/actions')

            return (
                <>
                    <H2>{t('action-card-disabled')}</H2>
                    <EmailAction {...defaultProps} disabled={true} />

                    <H2>{t('closed-not-populated')}</H2>
                    <EmailAction {...defaultProps} />

                    <H2>{t('open-not-populated')}</H2>
                    <EmailAction {...defaultProps} _testStartOpen={true} />

                    <H2>{t('closed-populated-enabled')}</H2>
                    <EmailAction {...defaultProps} action={action} />

                    <H2>{t('open-populated-enabled')}</H2>
                    <EmailAction {...defaultProps} _testStartOpen={true} action={action} />

                    <H2>{t('closed-populated-disabled')}</H2>
                    <EmailAction {...defaultProps} action={{ ...action, enabled: false }} />

                    <H2>{t('open-populated-disabled')}</H2>
                    <EmailAction {...defaultProps} _testStartOpen={true} action={{ ...action, enabled: false }} />
                </>
            )
        }}
    </WebStory>
)

EmailActionStory.storyName = 'EmailAction'
