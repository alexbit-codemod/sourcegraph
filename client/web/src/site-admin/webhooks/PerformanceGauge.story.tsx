import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { WebStory } from '../../components/WebStory'

import { PerformanceGauge } from './PerformanceGauge'
import { StyledPerformanceGauge } from './story/StyledPerformanceGauge'

const decorator: Decorator = story => <div className="p-3 container">{story()}</div>

const config: Meta = {
    title: 'web/site-admin/webhooks/PerformanceGauge',
    parameters: {
        chromatic: {
            viewports: [576],
        },
    },
    decorators: [decorator],
}

export default config

export const Loading: StoryFn = () => (
    <WebStory>
        {() => {
            const { t } = useTranslation('site-admin/webhooks')

            return <PerformanceGauge label={t('dog-sound-1')} />
        }}
    </WebStory>
)

export const Zero: StoryFn = () => (
    <WebStory>
        {() => {
            const { t } = useTranslation('site-admin/webhooks')

            return <PerformanceGauge count={0} label={t('dog-sound-2')} />
        }}
    </WebStory>
)

export const ZeroWithExplicitPlural: StoryFn = () => (
    <WebStory>
        {() => {
            const { t } = useTranslation('site-admin/webhooks')

            return <PerformanceGauge count={0} label={t('wolf-sound-1')} plural="wolves" />
        }}
    </WebStory>
)

ZeroWithExplicitPlural.storyName = 'zero with explicit plural'

export const One: StoryFn = () => (
    <WebStory>
        {() => {
            const { t } = useTranslation('site-admin/webhooks')

            return <PerformanceGauge count={1} label={t('dog-sound-3')} />
        }}
    </WebStory>
)

export const Many: StoryFn = () => (
    <WebStory>
        {() => {
            const { t } = useTranslation('site-admin/webhooks')

            return <PerformanceGauge count={42} label={t('dog-sound-4')} />
        }}
    </WebStory>
)

export const ManyWithExplicitPlural: StoryFn = () => (
    <WebStory>
        {() => {
            const { t } = useTranslation('site-admin/webhooks')

            return <PerformanceGauge count={42} label={t('wolf-sound-2')} plural="wolves" />
        }}
    </WebStory>
)

ManyWithExplicitPlural.storyName = 'many with explicit plural'

export const ClassOverrides: StoryFn = () => (
    <WebStory>
        {() => {
            const { t } = useTranslation('site-admin/webhooks')

            return <StyledPerformanceGauge count={42} label={t('dog-sound-5')} />
        }}
    </WebStory>
)

ClassOverrides.storyName = 'class overrides'
