import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { H2 } from '@sourcegraph/wildcard'

import { WebStory } from '../../../../../../../components/WebStory'

import { CaptureGroupInsightCard, LangStatsInsightCard, SearchInsightCard } from './InsightCards'

const meta: Meta = {
    title: 'web/insights/InsightCards',
    decorators: [story => <WebStory>{() => story()}</WebStory>],
    parameters: {
        chromatic: {
            viewports: [576, 1440],
            disableSnapshot: false,
        },
    },
}

export default meta

export const InsightCards: StoryFn = () => {
    const { t } = useTranslation('enterprise/insights/pages/insights/creation/intro/cards')

    return (
        <section className="row">
            <article className="col-sm-4">
                <H2>{t('search-insight-card')}</H2>
                <SearchInsightCard />
            </article>
            <article className="col-sm-4">
                <H2>{t('language-stats-insight-card')}</H2>
                <LangStatsInsightCard />
            </article>
            <article className="col-sm-4">
                <H2>{t('capture-group-insight-card')}</H2>
                <CaptureGroupInsightCard />
            </article>
        </section>
    )
}
