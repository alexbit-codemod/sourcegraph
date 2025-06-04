import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { Text } from '@sourcegraph/wildcard'

import { LoaderButton } from './LoaderButton'
import { WebStory } from './WebStory'

const decorator: Decorator = story => (
    <div className="container mt-3" style={{ width: 800 }}>
        {story()}
    </div>
)

const config: Meta = {
    title: 'web/LoaderButton',
    decorators: [decorator],
}

export default config

export const Inline: StoryFn = () => (
    <WebStory>
        {() => {
            const { t } = useTranslation('components')

            return (
                <Text>
                    <LoaderButton loading={true} label={t('loader-button-primary')} variant="primary" />
                </Text>
            )
        }}
    </WebStory>
)

export const Block: StoryFn = () => (
    <WebStory>
        {() => {
            const { t } = useTranslation('components')

            return (
                <LoaderButton loading={true} label={t('loader-button-secondary')} display="block" variant="primary" />
            )
        }}
    </WebStory>
)

export const WithLabel: StoryFn = () => (
    <WebStory>
        {() => {
            const { t } = useTranslation('components')

            return (
                <LoaderButton
                    alwaysShowLabel={true}
                    loading={true}
                    label={t('loader-button-tertiary')}
                    display="block"
                    variant="primary"
                />
            )
        }}
    </WebStory>
)
