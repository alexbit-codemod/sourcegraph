import React from 'react'

import { action } from '@storybook/addon-actions'
import type { StoryFn, Meta } from '@storybook/react'
import classNames from 'classnames'
import { flow } from 'lodash'
import { useTranslation } from 'react-i18next'

import '@storybook/addon-designs'

import { H1, H4, Text } from '..'
import { BrandedStory } from '../../stories/BrandedStory'

import { AlertLink } from '.'
import { Alert } from './Alert'
import { ALERT_VARIANTS } from './constants'

const preventDefault = <E extends React.SyntheticEvent>(event: E): E => {
    event.preventDefault()
    return event
}

const config: Meta = {
    title: 'wildcard/Alert',
    decorators: [story => <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>],
    parameters: {
        component: Alert,
        chromatic: {
            enableDarkMode: true,
            disableSnapshot: false,
        },
        design: [
            {
                type: 'figma',
                name: 'Figma Light',
                url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Design-Refresh-Systemization-source-of-truth?node-id=1563%3A196',
            },
            {
                type: 'figma',
                name: 'Figma Dark',
                url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Design-Refresh-Systemization-source-of-truth?node-id=1563%3A525',
            },
        ],
    },
}

export default config

export const Alerts: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Alert')

    return (
        <>
            <H1>{t('alerts')}</H1>
            <Text>{t('contextual-feedback-messages')}</Text>
            <div className="mb-2">
                {ALERT_VARIANTS.map(variant => {
                    const { t } = useTranslation('../../wildcard/src/components/Alert')

                    return (
                        <Alert key={variant} variant={variant}>
                            <H4>{t('too-many-matching-repositories')}</H4>
                            {t('repo-filter-instructions')}
                        </Alert>
                    )
                })}
                <Alert variant="info" className="d-flex align-items-center">
                    <div className="flex-grow-1">
                        <H4>{t('too-many-matching-repositories-duplicate')}</H4>
                        {t('repo-filter-instructions-duplicate')}
                    </div>
                    <AlertLink
                        className="mr-2"
                        to="/"
                        onClick={flow(preventDefault, action(classNames('link clicked')))}
                    >
                        {t('dismiss-button')}
                    </AlertLink>
                </Alert>

                <Alert variant="secondary" withIcon={false} className="d-flex align-items-center">
                    <div className="flex-grow-1">
                        <H4>{t('too-many-matching-repositories-another')}</H4>
                        {t('repo-filter-instructions-another')}
                    </div>
                    <AlertLink
                        className="mr-2"
                        to="/"
                        onClick={flow(preventDefault, action(classNames('link clicked')))}
                    >
                        {t('dismiss-button-another')}
                    </AlertLink>
                </Alert>
            </div>
        </>
    )
}
