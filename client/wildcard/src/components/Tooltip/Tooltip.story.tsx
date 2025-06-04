import { useState } from 'react'

import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { Button, Grid, Code, Text, Input } from '..'
import { BrandedStory } from '../../stories/BrandedStory'

import { Tooltip } from '.'

const decorator: Decorator = story => <BrandedStory>{() => <div className="p-5">{story()}</div>}</BrandedStory>

const config: Meta = {
    title: 'wildcard/Tooltip',

    decorators: [decorator],

    parameters: {
        component: Tooltip,
        design: [
            {
                type: 'figma',
                name: 'Figma Light',
                url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=3131%3A38534',
            },
            {
                type: 'figma',
                name: 'Figma Dark',
                url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=3131%3A38727',
            },
        ],
    },
}

export default config

export const Basic: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Tooltip')

    return (
        <Text>
            {t('you-can')}
            <Tooltip content="Tooltip 1">
                <strong>{t('hover-me')}</strong>
            </Tooltip>
            {t('or')}
            <Tooltip content="Tooltip 2">
                <strong>{t('me')}</strong>
            </Tooltip>
            .
        </Text>
    )
}

export const Conditional: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Tooltip')

    const [clicked, setClicked] = useState<boolean>(false)

    function onClick() {
        setClicked(true)
        setTimeout(() => setClicked(false), 1500)
    }

    return (
        <Grid columnCount={1}>
            <div>
                <Tooltip content={clicked ? "Now there's a Tooltip!" : null}>
                    <Button variant="primary" onClick={onClick}>
                        {t('click-me-tooltip')}
                    </Button>
                </Tooltip>
            </div>

            <Text>
                {t('tooltip-conditional-display')}
                <Code>{t('null-value')}</Code>
                {t('and-a')}
                <Code>{t('string-value')}</Code>
                {t('in-as')}
                <Code>{t('content-key')}</Code>.
            </Text>
        </Grid>
    )
}

export const DefaultOpen: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Tooltip')

    return (
        <Grid columnCount={1}>
            <div>
                <Tooltip content="Click me!" defaultOpen={true}>
                    <Button variant="primary">{t('example-tooltip')}</Button>
                </Tooltip>

                <Tooltip content="Click me too!" defaultOpen={true}>
                    <Button variant="primary" style={{ position: 'absolute', right: '1rem' }}>
                        {t('absolutely-positioned-example')}
                    </Button>
                </Tooltip>
            </div>

            <Text>
                {t('pinned-tooltip-initial-render')}
                <Code>{t('default-open-true')}</Code>.
            </Text>
        </Grid>
    )
}

DefaultOpen.storyName = 'Default Open (Pinned)'
DefaultOpen.parameters = {
    chromatic: {
        enableDarkMode: true,
        disableSnapshot: false,
    },
}

export const DisabledTrigger: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Tooltip')

    return (
        <Grid columnCount={1}>
            <div>
                <Tooltip content="Tooltip still works properly" placement="right">
                    <Button variant="primary" disabled={true}>
                        {t('disabled-button')}
                    </Button>
                </Tooltip>
            </div>

            <div>
                <Tooltip content="Tooltip still works properly" placement="right">
                    <Input placeholder={t('disabled-input')} disabled={true} style={{ width: '300px' }} />
                </Tooltip>
            </div>

            <Text>
                {t('disabled-elements')}
                <Code>{'<Button>'}</Code>
                {t('and')}
                <Code>{'<Input>'}</Code>
                {t('no-additional-modifications')}
            </Text>
        </Grid>
    )
}

export const LongContent: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Tooltip')

    return (
        <Grid columnCount={1}>
            <div>
                <Tooltip
                    content="Nulla porttitor accumsan tincidunt. IAmVeryLongTextWithNoBreaksAndIWantToBeWrappedInMultipleLines. Proin eget tortor risus. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Donec rutrum congue leo eget malesuada."
                    placement="bottom"
                >
                    <Button variant="primary">{t('example-tooltip-2')}</Button>
                </Tooltip>
            </div>

            <Text>
                {t('tooltips-long-text')}
                <Code>--tooltip-max-width</Code>.
            </Text>
        </Grid>
    )
}

export const PlacementOptions: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Tooltip')

    return (
        <>
            <Grid columnCount={5}>
                <div>
                    <Tooltip content="Tooltip on top" placement="top">
                        <Button variant="primary">{t('top-placement')}</Button>
                    </Tooltip>
                </div>

                <div>
                    <Tooltip content="Tooltip on right" placement="right">
                        <Button variant="primary">{t('right-placement')}</Button>
                    </Tooltip>
                </div>

                <div>
                    <Tooltip content="Tooltip on bottom" placement="bottom">
                        <Button variant="primary">{t('bottom-placement')}</Button>
                    </Tooltip>
                </div>

                <div>
                    <Tooltip content="Tooltip on left" placement="left">
                        <Button variant="primary">{t('left-placement')}</Button>
                    </Tooltip>
                </div>

                <div>
                    <Tooltip content="Default Tooltip placement">
                        <Button variant="primary">{t('default-placement')}</Button>
                    </Tooltip>
                </div>
            </Grid>

            <Text>
                {t('tooltip-specified-placement')}
                <Code>{t('placement-key')}</Code>
                {t('viewport-collision-mirror')}
            </Text>
        </>
    )
}

export const UpdateContent: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Tooltip')

    const [clicked, setClicked] = useState<boolean>(false)

    function onClick() {
        setClicked(true)
        setTimeout(() => setClicked(false), 1500)
    }

    return (
        <Grid columnCount={1}>
            <div>
                <Tooltip content={clicked ? 'New message!' : 'Click to change the message.'} placement="right">
                    <Button variant="primary" onClick={onClick}>
                        {t('click-me')}
                    </Button>
                </Tooltip>
            </div>

            <Text>
                {t('string-passed-as-content')}
                <Code>{t('content-modification')}</Code>
                {t('no-controlled-updates-required')}
            </Text>
        </Grid>
    )
}
