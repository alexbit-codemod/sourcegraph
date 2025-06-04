import type { Meta, StoryFn, Decorator } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { WebStory } from '../../../components/WebStory'

import { InsightTemplatesBanner } from './InsightTemplatesBanner'

const decorator: Decorator = story => <div className="p-3 container">{story()}</div>

const config: Meta = {
    title: 'web/batches/create/InsightTemplatesBanner',
    decorators: [decorator],
}

export default config

export const CreatingNewBatchChangeFromInsight: StoryFn = () => (
    <WebStory>
        {props => {
            const { t } = useTranslation('enterprise/batches/create')

            return <InsightTemplatesBanner {...props} insightTitle={t('my-go-insight-1')} type="create" />
        }}
    </WebStory>
)

CreatingNewBatchChangeFromInsight.storyName = 'Creating new batch change from insight'

export const EditingBatchSpecFromInsightTemplate: StoryFn = () => (
    <WebStory>
        {props => {
            const { t } = useTranslation('enterprise/batches/create')

            return <InsightTemplatesBanner {...props} insightTitle={t('my-go-insight-2')} type="edit" />
        }}
    </WebStory>
)

EditingBatchSpecFromInsightTemplate.storyName = 'Editing a batch spec from an insight template'
