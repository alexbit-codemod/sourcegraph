import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation, Trans } from 'react-i18next'

import { BrandedStory } from '../../stories'
import { Link } from '../Link'

import { Code, Label, H1, H2, H3, H4, H5, H6, Text } from '.'
import { TYPOGRAPHY_ALIGNMENTS, TYPOGRAPHY_MODES } from './constants'
import { Heading } from './Heading'

const decorator: Decorator = story => (
    <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>
)

const config: Meta = {
    title: 'wildcard/Typography',

    decorators: [decorator],

    parameters: {
        component: Label,
        chromatic: {
            enableDarkMode: true,
            disableSnapshot: false,
        },
        design: {
            type: 'figma',
            name: 'Figma',
            url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=5601%3A65477',
        },
    },
}

export default config

export const Simple: StoryFn = (args = {}) => {
    const { t } = useTranslation('../../wildcard/src/components/Typography')

    return (
        <>
            <H2>{t('headings')}</H2>
            <table className="table">
                <tbody>
                    <tr>
                        <td>
                            <Code>{t('h1-start-tag')}</Code>
                        </td>
                        <td>
                            <H1 mode={args.mode} alignment={args.alignment}>
                                {t('h1-text')}
                            </H1>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <Code>{t('h2-start-tag')}</Code>
                        </td>
                        <td>
                            <H2 mode={args.mode} alignment={args.alignment}>
                                {t('h2-text')}
                            </H2>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <Code>{t('h3-start-tag')}</Code>
                        </td>
                        <td>
                            <H3 mode={args.mode} alignment={args.alignment}>
                                {t('h3-text')}
                            </H3>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <Code>{t('h4-start-tag')}</Code>
                        </td>
                        <td>
                            <H4 mode={args.mode} alignment={args.alignment}>
                                {t('h4-text')}
                            </H4>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <Code>{t('h5-start-tag')}</Code>
                        </td>
                        <td>
                            <H5 mode={args.mode} alignment={args.alignment}>
                                {t('h5-text')}
                            </H5>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <Code>{t('h6-start-tag')}</Code>
                        </td>
                        <td>
                            <H6 mode={args.mode} alignment={args.alignment}>
                                {t('h6-text')}
                            </H6>
                        </td>
                    </tr>
                </tbody>
            </table>

            <H2>{t('code')}</H2>
            <table className="table">
                <tbody>
                    <tr>
                        <td>
                            <Code>{t('code-start-tag')}</Code>
                        </td>
                        <td>
                            <div>
                                <Code size="base" weight="regular">
                                    {t('code-base-regular')}
                                </Code>
                            </div>
                            <div>
                                <Code size="base" weight="bold">
                                    {t('code-base-bold')}
                                </Code>
                            </div>
                            <div>
                                <Code size="small" weight="regular">
                                    {t('code-small-regular')}
                                </Code>
                            </div>
                            <div>
                                <Code size="small" weight="bold">
                                    {t('code-small-bold')}
                                </Code>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <H2>{t('label')}</H2>
            <table className="table">
                <tbody>
                    <tr>
                        <td>
                            <Code>{t('label-start-tag')}</Code>
                        </td>
                        <td>
                            <div>
                                <Label mode={args.mode} alignment={args.alignment} size="base">
                                    {t('label-base')}
                                </Label>
                            </div>
                            <div>
                                <Label mode={args.mode} alignment={args.alignment} size="base" isUnderline={true}>
                                    {t('label-base-underline')}
                                </Label>
                            </div>
                            <div>
                                <Label mode={args.mode} alignment={args.alignment} size="small">
                                    {t('label-small')}
                                </Label>
                            </div>
                            <div>
                                <Label mode={args.mode} alignment={args.alignment} size="small" isUnderline={true}>
                                    {t('label-small-underline')}
                                </Label>
                            </div>
                            <div>
                                <Label mode={args.mode} alignment={args.alignment} isUppercase={true}>
                                    {t('label-uppercase-base')}
                                </Label>
                            </div>
                            <div>
                                <Label mode={args.mode} alignment={args.alignment} size="small" isUppercase={true}>
                                    {t('label-uppercase-small')}
                                </Label>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <H2>{t('text')}</H2>
            <table className="table">
                <tbody>
                    <tr>
                        <td>
                            <Code>{t('text-start-tag')}</Code>
                        </td>
                        <td>
                            <Text mode={args.mode} alignment={args.alignment} size="base" weight="regular">
                                {t('body-base-regular')}
                            </Text>
                            <Text mode={args.mode} alignment={args.alignment} size="base" weight="medium">
                                {t('body-base-medium')}
                            </Text>
                            <Text mode={args.mode} alignment={args.alignment} size="base" weight="bold">
                                {t('body-base-bold')}
                            </Text>
                            <Text mode={args.mode} alignment={args.alignment} size="small" weight="regular">
                                {t('body-small-regular')}
                            </Text>
                            <Text mode={args.mode} alignment={args.alignment} size="small" weight="medium">
                                {t('body-small-medium')}
                            </Text>
                            <Text mode={args.mode} alignment={args.alignment} size="small" weight="bold">
                                {t('body-small-bold')}
                            </Text>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

Simple.argTypes = {
    mode: {
        control: { type: 'select', options: TYPOGRAPHY_MODES },
    },
    alignment: {
        control: { type: 'select', options: TYPOGRAPHY_ALIGNMENTS },
    },
}
Simple.args = {
    mode: 'default',
    alignment: 'left',
}

export const CrossingStyles: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Typography')

    return (
        <>
            <H1>{t('crossing-header-styles')}</H1>
            <Text>
                {t('crossing-header-introduction')}
                <Code>{'<h2>'}</Code>
                {t('crossing-header-styles-example')}
                <Code>{'<h3>'}</Code>
                <Trans
                    i18nKey="crossing-header-accessibility"
                    components={{
                        '0': (
                            <Link
                                target="_blank"
                                rel="noopener noreferrer"
                                to="https://docs-legacy.sourcegraph.com/dev/background-information/web/accessibility/detailed-checklist#headings"
                            />
                        ),
                    }}
                />
            </Text>
            <Text>
                <Trans i18nKey="crossing-header-downscale" components={{ '0': <strong /> }} />
                <Code>{'<h2>'}</Code>
                {t('crossing-header-upscale')}
                <Code>{'<h3>'}</Code>
                <Trans i18nKey="crossing-header-upscale-example" components={{ '0': <strong /> }} />
                <Code>{'<h3>'}</Code>
                {t('crossing-header-upscale-another-example')}
                <Code>{'<h2>'}</Code>
                {t('crossing-header-css-priority')}
            </Text>

            <H2 className="mt-4 mb-3">{t('examples-downscaling')}</H2>

            <H2>{t('normal-h2')}</H2>
            <H3 as={H2}>{t('h2-style-h3')}</H3>
            <H4 as={H2}>{t('h2-style-h4')}</H4>
            <H5 as={H2}>{t('h2-style-h5')}</H5>

            <H2 className="mt-5 mb-3">{t('examples-upscaling')}</H2>
            <H4>{t('normal-h4')}</H4>
            <Heading as="h4" styleAs="h3">
                {t('h4-style-h3')}
            </Heading>
            <Heading as="h4" styleAs="h2">
                {t('h4-style-h2')}
            </Heading>
            <Heading as="h4" styleAs="h1">
                {t('h4-style-h1')}
            </Heading>
        </>
    )
}

const SEMANTIC_COLORS = ['primary', 'success', 'danger', 'warning', 'info', 'merged'] as const
export const Prose: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Typography')

    return (
        <>
            <H2>{t('prose')}</H2>
            <Text>{t('text-fonts')}</Text>
            <Text>{t('text-description')}</Text>

            <Text>
                <Trans i18nKey="text-links" components={{ '0': <Link to="/" /> }} />
            </Text>

            <Text>
                <Trans i18nKey="text-emphasis" components={{ '0': <em />, '1': <strong /> }} />
            </Text>

            <Text>
                <Trans i18nKey="text-idiomatic" components={{ '0': <i /> }} />
                <Code>{'<i>'}</Code>
                <Trans
                    i18nKey="text-idiomatic-comparison"
                    components={{
                        '0': (
                            <Link
                                target="__blank"
                                to="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/em#%3Ci%3E_vs._%3Cem%3E"
                            />
                        ),
                    }}
                />
            </Text>

            <Text>
                <Trans i18nKey="text-element-attention" components={{ '0': <b /> }} />
                <Code>{'<b>'}</Code>.
            </Text>

            <Text>
                <Trans i18nKey="text-superscripts" components={{ '0': <sup /> }} />
                <Code>{'<sup>'}</Code>.
            </Text>

            <Text>
                <Trans i18nKey="text-subscripts" components={{ '0': <sub /> }} />
                <Code>{'<sub>'}</Code>.
            </Text>

            <Text>
                <small>
                    {t('text-small')}
                    <Code>{'<small>'}</Code>
                    {t('text-small-usage')}
                </small>
            </Text>

            <H2>{t('color-variations')}</H2>
            <Text>
                <Code>{t('text-color-classes')}</Code>
                {t('text-color-description')}
            </Text>
            <div className="mb-3">
                {['muted', ...SEMANTIC_COLORS].map(color => {
                    const { t } = useTranslation('../../wildcard/src/components/Typography')

                    return (
                        <div key={color} className={'text-' + color}>
                            {t('text-color-example', { color })}
                        </div>
                    )
                })}
            </div>

            <H2>{t('lists')}</H2>
            <H3>{t('ordered-lists')}</H3>
            <ol>
                <li>{t('ordered-list-example-1')}</li>
                <li>{t('ordered-list-example-2')}</li>
                <li>{t('ordered-list-example-3')}</li>
            </ol>

            <H3>{t('unordered-lists')}</H3>

            <H4>{t('dots')}</H4>
            <ul>
                <li>{t('unordered-list-example-1')}</li>
                <li>{t('unordered-list-example-2')}</li>
                <li>{t('unordered-list-example-3')}</li>
            </ul>

            <H4>{t('dashes')}</H4>
            <Text>
                {t('dashed-lists-description')}
                <Code>list-dashed</Code>.
            </Text>
            <ul className="list-dashed">
                <li>{t('dashed-list-example-1')}</li>
                <li>{t('dashed-list-example-2')}</li>
                <li>{t('dashed-list-example-3')}</li>
            </ul>
        </>
    )
}
