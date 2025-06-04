import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { WebStory } from '../../../components/WebStory'

import { TemplateBanner } from './TemplateBanner'

const decorator: Decorator = story => <div className="p-3 container">{story()}</div>

const config: Meta = {
    title: 'web/batches/create',
    decorators: [decorator],
}

export default config

export const TemplateBannerStory: StoryFn = () => (
    <WebStory>
        {props => {
            const { t } = useTranslation('enterprise/batches/create')

            return (
                <TemplateBanner
                    heading="You are creating a Batch Change from a Code Search"
                    description={t('let-sourcegraph-help-refactor-code')}
                    {...props}
                />
            )
        }}
    </WebStory>
)

TemplateBannerStory.storyName = 'Template for banners'
