import { useState } from 'react'

import type { Meta, StoryFn } from '@storybook/react'
import classNames from 'classnames'
import SearchIcon from 'mdi-react/SearchIcon'
import { useTranslation } from 'react-i18next'

import { H1, H2, Text, Tooltip, ButtonLink, Code } from '../..'
import { BrandedStory } from '../../../stories/BrandedStory'
import { Button } from '../Button'
import { ButtonGroup } from '../ButtonGroup'
import { BUTTON_VARIANTS, BUTTON_SIZES } from '../constants'

import { ButtonVariants } from './ButtonVariants'

const config: Meta = {
    title: 'wildcard/Button',
    component: Button,

    decorators: [story => <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>],

    parameters: {
        component: Button,
        design: [
            {
                type: 'figma',
                name: 'Figma Light',
                url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=908%3A2513',
            },
            {
                type: 'figma',
                name: 'Figma Dark',
                url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=908%3A5794',
            },
        ],
    },
}

export default config

export const Simple: StoryFn = (args = {}) => {
    const { t } = useTranslation('../../wildcard/src/components/Button/story')

    return (
        <Button variant={args.variant} size={args.size} disabled={args.disabled} outline={args.outline}>
            {t('click-me')}
        </Button>
    )
}
Simple.argTypes = {
    variant: {
        name: 'Variant',
        control: { type: 'select', options: BUTTON_VARIANTS },
    },
    size: {
        name: 'Name',
        control: { type: 'select', options: BUTTON_SIZES },
    },
    disabled: {
        name: 'Disabled',
        control: { type: 'boolean' },
    },
    outline: {
        name: 'Outline',
        control: { type: 'boolean' },
    },
}
Simple.args = {
    variant: 'primary',
    size: 'sm',
    disabled: false,
    outline: false,
}

export const AllButtons: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Button/story')

    return (
        <div className="pb-3">
            <H1>{t('buttons')}</H1>
            <H2>{t('variants')}</H2>
            <ButtonVariants variants={BUTTON_VARIANTS} />
            <H2>{t('outline')}</H2>
            <ButtonVariants variants={['primary', 'secondary', 'danger']} outline={true} />
            <H2>{t('icons')}</H2>
            <Text>{t('icons-with-buttons')}</Text>
            <ButtonVariants variants={['danger']} icon={SearchIcon} />
            <ButtonVariants variants={['danger']} icon={SearchIcon} outline={true} />
            <H2>{t('smaller-buttons')}</H2>
            <Text>{t('make-buttons-smaller')}</Text>
            <ButtonVariants variants={['primary']} size="sm" outline={true} />
            <H2>{t('links')}</H2>
            <Text>{t('links-as-buttons')}</Text>
            <ButtonLink
                variant="secondary"
                to="https://example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3"
            >
                {t('link-example')}
            </ButtonLink>
            <Text>{t('buttons-as-links')}</Text>
            <ButtonVariants variants={['link']} />
            <H2>{t('button-display')}</H2>
            <Button className="mb-3" size="sm" variant="secondary" display="inline">
                {t('inline-button')}
            </Button>
            <Button size="sm" variant="secondary" display="block">
                {t('block-button')}
            </Button>

            <H2>{t('tooltips')}</H2>
            <Text>{t('buttons-with-tooltips')}</Text>
            <Tooltip content="Some extra context on the button.">
                <Button variant="primary" className="mr-3">
                    {t('enabled-state')}
                </Button>
            </Tooltip>
            <Tooltip content="Some extra context on why the button is disabled.">
                <Button variant="primary" disabled={true}>
                    {t('disabled-state')}
                </Button>
            </Tooltip>
        </div>
    )
}

AllButtons.parameters = {
    chromatic: {
        enableDarkMode: true,
        disableSnapshot: false,
    },
}

type ButtonSizesType = typeof BUTTON_SIZES[number] | undefined

export const Group: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Button/story')

    const [active, setActive] = useState<'Left' | 'Middle' | 'Right'>('Left')
    const buttonSizes: ButtonSizesType[] = ['lg', undefined, 'sm']

    return (
        <>
            <H1>{t('button-groups')}</H1>

            <H2>{t('example')}</H2>
            <div className="mb-2">
                <Text>{t('button-groups-description')}</Text>
                <div className="mb-2">
                    <ButtonGroup aria-label="Basic example">
                        <Button variant="secondary">{t('left-alignment')}</Button>
                        <Button variant="secondary">{t('middle-alignment')}</Button>
                        <Button variant="secondary">{t('right-alignment')}</Button>
                    </ButtonGroup>
                    {t('example-secondary-buttons')}
                </div>
                <div className="mb-2">
                    <ButtonGroup aria-label="Basic example">
                        <Button outline={true} variant="secondary">
                            {t('left-example')}
                        </Button>
                        <Button outline={true} variant="secondary">
                            {t('middle-example')}
                        </Button>
                        <Button outline={true} variant="secondary">
                            {t('right-example')}
                        </Button>
                    </ButtonGroup>
                    {t('example-secondary-outline-buttons')}
                </div>
                <div className="mb-2">
                    <ButtonGroup aria-label="Basic example">
                        <Button outline={true} variant="primary">
                            {t('left-outline-example')}
                        </Button>
                        <Button outline={true} variant="primary">
                            {t('middle-outline-example')}
                        </Button>
                        <Button outline={true} variant="primary">
                            {t('right-outline-example')}
                        </Button>
                    </ButtonGroup>
                    {t('example-primary-outline-buttons')}
                </div>
            </div>

            <H2 className="mt-3">{t('sizing')}</H2>
            <Text>
                {t('button-groups-sizing')}
                <Code>{t('small-size')}</Code>
                {t('and')}
                <Code>{t('large-size')}</Code>
                {t('size-variants')}
            </Text>
            <div className="mb-2">
                {buttonSizes.map(size => {
                    const { t } = useTranslation('../../wildcard/src/components/Button/story')

                    return (
                        <div key={size} className="mb-2">
                            <ButtonGroup aria-label="Sizing example">
                                <Button size={size} outline={true} variant="primary">
                                    {t('left-group')}
                                </Button>
                                <Button size={size} outline={true} variant="primary">
                                    {t('middle-group')}
                                </Button>
                                <Button size={size} outline={true} variant="primary">
                                    {t('right-group')}
                                </Button>
                            </ButtonGroup>
                        </div>
                    )
                })}
            </div>

            <H2 className="mt-3">{t('active-state')}</H2>
            <Text>
                {t('active-class')}
                <Code>{t('active')}</Code>
                {t('active-toggle-description')}
            </Text>
            <div className="mb-2">
                <ButtonGroup aria-label="Basic example">
                    {(['Left', 'Middle', 'Right'] as const).map(option => (
                        <Button
                            key={option}
                            className={classNames(option === active && 'active')}
                            onClick={() => setActive(option)}
                            aria-pressed={option === active}
                            outline={true}
                            variant="secondary"
                        >
                            {option}
                        </Button>
                    ))}
                </ButtonGroup>
                {t('example-secondary-outline-buttons')}
            </div>
            <div className="mb-2">
                <ButtonGroup aria-label="Basic example">
                    {(['Left', 'Middle', 'Right'] as const).map(option => (
                        <Button
                            key={option}
                            className={classNames(option === active && 'active')}
                            onClick={() => setActive(option)}
                            aria-pressed={option === active}
                            outline={true}
                            variant="primary"
                        >
                            {option}
                        </Button>
                    ))}
                </ButtonGroup>
                {t('example-primary-outline-buttons')}
            </div>
            <div className="mb-2">
                <ButtonGroup aria-label="Basic example">
                    {(['Left', 'Middle', 'Right'] as const).map(option => (
                        <Button
                            key={option}
                            className={classNames(option === active && 'active')}
                            onClick={() => setActive(option)}
                            aria-pressed={option === active}
                            variant="secondary"
                        >
                            {option}
                        </Button>
                    ))}
                </ButtonGroup>
                {t('example-secondary-buttons')}
            </div>
            <div className="mb-2">
                <ButtonGroup aria-label="Basic example">
                    {(['Left', 'Middle', 'Right'] as const).map(option => (
                        <Button
                            key={option}
                            className={classNames(option === active && 'active')}
                            onClick={() => setActive(option)}
                            aria-pressed={option === active}
                            variant="primary"
                        >
                            {option}
                        </Button>
                    ))}
                </ButtonGroup>
                {t('example-primary-buttons')}
            </div>
            <div className="mb-2">
                <ButtonGroup aria-label="Basic example">
                    {(['Left', 'Middle', 'Right'] as const).map(option => (
                        <Button
                            key={option}
                            className={classNames(option === active && 'active')}
                            onClick={() => setActive(option)}
                            aria-pressed={option === active}
                            variant="link"
                        >
                            {option}
                        </Button>
                    ))}
                </ButtonGroup>
                {t('example-link-buttons')}
            </div>

            <H2 className="mt-3">{t('with-tooltips')}</H2>
            <div className="mb-2">
                <ButtonGroup aria-label="With Tooltips">
                    {(['Left', 'Middle', 'Right'] as const).map(option => (
                        <Tooltip key={option} content={`Option ${option}`}>
                            <Button
                                variant="secondary"
                                outline={option === active}
                                onClick={() => setActive(option)}
                                aria-pressed={option === active}
                            >
                                {option}
                            </Button>
                        </Tooltip>
                    ))}
                </ButtonGroup>
                {t('example-enabled-buttons')}
            </div>
            <div className="mb-2">
                <ButtonGroup aria-label="With Tooltips (Disabled Buttons)">
                    {(['Left', 'Middle', 'Right'] as const).map(option => (
                        <Tooltip key={option} content={`Option ${option}`}>
                            <Button
                                variant="secondary"
                                disabled={true}
                                outline={option === active}
                                onClick={() => setActive(option)}
                                aria-pressed={option === active}
                            >
                                {option}
                            </Button>
                        </Tooltip>
                    ))}
                </ButtonGroup>
                {t('example-disabled-buttons')}
            </div>
        </>
    )
}

Group.storyName = 'Button Group'
Group.parameters = {
    chromatic: {
        enableDarkMode: true,
        disableSnapshot: false,
    },
}
