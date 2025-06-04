import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { noOpTelemetryRecorder } from '@sourcegraph/shared/src/telemetry'
import { H1, H2, Code, Text } from '@sourcegraph/wildcard'
import { BrandedStory } from '@sourcegraph/wildcard/src/stories'

import { AlertType } from '../graphql-operations'

import { GlobalAlert } from './GlobalAlert'

import webStyles from '../SourcegraphWebApp.scss'

const config: Meta = {
    title: 'web/GlobalAlert',

    decorators: [
        story => (
            <BrandedStory styles={webStyles}>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>
        ),
    ],

    parameters: {
        component: GlobalAlert,
        chromatic: {
            disableSnapshot: false,
        },
    },
}

export default config

export const GlobalAlerts: StoryFn = () => {
    const { t } = useTranslation('global')

    return (
        <div>
            <H1>{t('global-alert')}</H1>
            <Text>
                {t('alert-description')}
                <Code>AlertType</Code>
                {t('backend-api-response')}
            </Text>
            <H2>{t('variants-title')}</H2>
            {Object.values(AlertType).map(type => (
                <GlobalAlert
                    key={type}
                    alert={{ message: 'Something happened!', isDismissibleWithKey: null, type }}
                    telemetryRecorder={noOpTelemetryRecorder}
                />
            ))}
            <H2>{t('dismissible-alert')}</H2>
            <GlobalAlert
                alert={{ message: 'You can dismiss me', isDismissibleWithKey: 'dismiss-key', type: AlertType.INFO }}
                telemetryRecorder={noOpTelemetryRecorder}
            />
        </div>
    )
}
