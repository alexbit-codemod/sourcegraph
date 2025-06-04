import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { WebStory } from '../../components/WebStory'

import { Description } from './Description'

const decorator: Decorator = story => <div className="p-3 container">{story()}</div>

const config: Meta = {
    title: 'web/batches/Description',
    decorators: [decorator],
}

export default config

export const Overview: StoryFn = () => (
    <WebStory>
        {props => {
            const { t } = useTranslation('enterprise/batches')

            return <Description {...props} description={t('awesome-batch-change-impact')} />
        }}
    </WebStory>
)
