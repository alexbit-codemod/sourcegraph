import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { H1, Text } from '../..'
import { BrandedStory } from '../../../stories/BrandedStory'

import { FeedbackText } from '.'

const config: Meta = {
    title: 'wildcard/FeedbackText',

    decorators: [story => <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>],
    parameters: {
        component: FeedbackText,
        chromatic: {
            enableDarkMode: true,
            disableSnapshot: false,
        },
    },
}

export default config

export const FeedbackTextExample: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Feedback/FeedbackText')

    return (
        <>
            <H1>FeedbackText</H1>
            <Text>{t('feedback-example-with-header')}</Text>
            <FeedbackText headerText={t('header-text-example')} />
            <Text>{t('feedback-example-with-footer')}</Text>
            <FeedbackText footerText={t('footer-text-example')} />
        </>
    )
}
