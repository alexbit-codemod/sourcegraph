import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { subDays } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { H3, Code } from '@sourcegraph/wildcard'

import { WebStory } from '../WebStory'

import { Duration } from './Duration'

const decorator: Decorator = story => <div className="p-3 container">{story()}</div>

const now = new Date()

const config: Meta = {
    title: 'web/Duration',
    decorators: [decorator],
    argTypes: {
        start: {
            control: { type: 'date' },
        },
    },
    args: {
        start: subDays(now, 1),
    },
}

export default config

export const Fixed: StoryFn = args => (
    <WebStory>{props => <Duration {...props} start={new Date(args.start)} end={new Date(args.end)} />}</WebStory>
)
Fixed.argTypes = {
    end: {
        control: { type: 'date' },
    },
}
Fixed.args = {
    start: now,
    end: now,
}

export const Active: StoryFn = args => (
    <WebStory>
        {props => {
            const { t } = useTranslation('components/time')

            return (
                <>
                    <H3>{t('borders-layout-shift')}</H3>
                    <div className="d-flex">
                        <span style={{ backgroundColor: 'red', width: 100 }} />
                        <Duration {...props} start={new Date(args.start)} />
                        <span style={{ backgroundColor: 'red', width: 100 }} />
                    </div>
                    <H3 className="mt-4">
                        <Code>{t('stable-width-false')}</Code>
                    </H3>
                    <div className="d-flex">
                        <span style={{ backgroundColor: 'red', width: 100 }} />
                        <Duration {...props} start={new Date(args.start)} stableWidth={false} />
                        <span style={{ backgroundColor: 'red', width: 100 }} />
                    </div>
                </>
            )
        }}
    </WebStory>
)
