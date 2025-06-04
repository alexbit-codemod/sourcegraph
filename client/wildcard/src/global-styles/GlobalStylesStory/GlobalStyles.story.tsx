// This story is NOT a complete replication of the Bootstrap documentation. This means it is not an exhaustive
// documentation of all the Bootstrap classes we have available in our app, please see refer to the Bootstrap
// documentation for that. Its primary purpose is to show what Bootstrap's components look like with our styling
// customizations.
import { action } from '@storybook/addon-actions'
import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation, Trans } from 'react-i18next'

import '@storybook/addon-designs'

import { TextArea, Button, Link, Select, Checkbox, Input, Text, Code, H1, H2, H3, H4, Form } from '../../components'
import { BrandedStory } from '../../stories'
import { highlightCodeSafe, registerHighlightContributions } from '../../utils'

import { ColorVariants } from './ColorVariants'
import { FormFieldVariants } from './FormFieldVariants'
import { preventDefault } from './utils'

registerHighlightContributions()

const decorator: Decorator = story => (
    <BrandedStory>{() => <div className="p-3 container">{story()}</div>}</BrandedStory>
)
const config: Meta = {
    title: 'branded/Global styles',
    decorators: [decorator],
    parameters: {
        chromatic: {
            enableDarkMode: true,
        },
    },
}

export default config

export const CodeTypography: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/global-styles/GlobalStylesStory')

    return (
        <>
            <H1>{t('code')}</H1>

            <H2>{t('inline-code')}</H2>
            <Text>
                {t('example-of-inline-code')}
                <Code>{t('inline-code-description')}</Code>
                {t('achieved-with-element')}
                <Code>{'<code>'}</Code>
                {t('highlighted-multi-line-code')}
            </Text>

            <H2>{t('custom-highlight-themes')}</H2>
            <Text>{t('json')}</Text>

            <H3>TypeScript</H3>
            <pre>
                <Code
                    dangerouslySetInnerHTML={{
                        __html: highlightCodeSafe(
                            ['const foo = 123', 'const bar = "Hello World!"', 'console.log(foo)'].join('\n'),
                            'typescript'
                        ),
                    }}
                />
            </pre>

            <H3>{t('diffs')}</H3>
            <pre>
                <Code
                    dangerouslySetInnerHTML={{
                        __html: highlightCodeSafe(
                            ['{', '  "someString": "Hello World!",', '  "someNumber": 123', '}'].join('\n'),
                            'json'
                        ),
                    }}
                />
            </pre>

            <H3>{t('keyboard-shortcuts')}</H3>
            <pre>
                <Code
                    dangerouslySetInnerHTML={{
                        __html: highlightCodeSafe(
                            [
                                ' const foo = 123',
                                '-const bar = "Hello, world!"',
                                '+const bar = "Hello, traveller!"',
                                ' console.log(foo)',
                            ].join('\n'),
                            'diff'
                        ),
                    }}
                />
            </pre>

            <H2>{t('keyboard-shortcuts-usage')}</H2>
            <Text>
                {t('example-keyboard-shortcut')}
                <Code>{'<kbd>'}</Code>
                {t('code-snippets')}
                <Code>{'<code>'}</Code>
                <Trans i18nKey="colors" components={{ '0': <kbd />, '1': <kbd /> }} />
            </Text>
            <H3>{t('semantic-colors')}</H3>
        </>
    )
}

export const Colors: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/global-styles/GlobalStylesStory')

    return (
        <>
            <H1>{t('semantic-colors-description')}</H1>

            <H2>{t('layout')}</H2>
            <Text>{t('spacing')}</Text>
            <ColorVariants />
        </>
    )
}

Colors.parameters = {
    design: {
        name: 'Figma',
        type: 'figma',
        url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Design-Refresh-Systemization-source-of-truth?node-id=908%3A7608',
    },
}

export const Layout: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/global-styles/GlobalStylesStory')

    return (
        <>
            <H1>{t('margin-and-padding-utilities')}</H1>

            <H2>{t('8pt-grid-system')}</H2>
            <Text>
                {t('rem-units')}
                <Code>{t('one-dimensional-layout')}</Code>
                {t('flexbox-for-layouts')}
                <Code>{t('row-layout')}</Code>
                <Trans
                    i18nKey="equally-distributed-columns"
                    components={{
                        '0': (
                            <Link
                                to="https://builttoadapt.io/intro-to-the-8-point-grid-system-d2573cde8632"
                                target="_blank"
                                rel="noopener noreferrer"
                            />
                        ),
                    }}
                />
                <Code>{t('middle-column-growing')}</Code>
                {t('two-dimensional-layout')}
                <Code>0.25</Code>.
            </Text>

            <H2>{t('css-grid-for-layouts')}</H2>
            <Text>
                <Trans
                    i18nKey="cell-1"
                    components={{
                        '0': (
                            <Link
                                to="https://css-tricks.com/snippets/css/a-guide-to-flexbox/"
                                target="_blank"
                                rel="noopener noreferrer"
                            />
                        ),
                        '1': (
                            <Link
                                to="https://getbootstrap.com/docs/4.5/utilities/flex/"
                                target="_blank"
                                rel="noopener noreferrer"
                            />
                        ),
                    }}
                />
            </Text>

            <H3>{t('cell-2')}</H3>
            <H4>{t('input-groups')}</H4>
            <div
                className="d-flex p-1 border mb-2 overflow-hidden"
                style={{ resize: 'both', minWidth: '16rem', minHeight: '3rem' }}
            >
                <div className="p-1 m-1 flex-grow-1 d-flex justify-content-center align-items-center border">
                    {t('input-groups-description')}
                </div>
                <div className="p-1 m-1 flex-grow-1 d-flex justify-content-center align-items-center border">
                    {t('example-input')}
                </div>
                <div className="p-1 m-1 flex-grow-1 d-flex justify-content-center align-items-center border">
                    {t('forms')}
                </div>
            </div>

            <H4>{t('forms-validation')}</H4>
            <div
                className="d-flex p-1 border mb-2 overflow-hidden"
                style={{ resize: 'both', minWidth: '16rem', minHeight: '3rem' }}
            >
                <div className="p-1 m-1 d-flex justify-content-center align-items-center border border">
                    {t('email-input')}
                </div>
                <div className="p-1 m-1 d-flex justify-content-center align-items-center border flex-grow-1 border">
                    {t('password-input')}
                </div>
                <div className="p-1 m-1 d-flex justify-content-center align-items-center border border">
                    {t('option-a')}
                </div>
            </div>

            <H3>{t('option-b')}</H3>
            <div
                className="d-flex flex-column p-1 border mb-2 overflow-hidden"
                style={{ minHeight: '8rem', height: '12rem', minWidth: '6rem', width: '12rem', resize: 'both' }}
            >
                <div className="p-1 m-1 flex-grow-1 border d-flex align-items-center justify-content-center">
                    {t('option-c')}
                </div>
                <div className="p-1 m-1 flex-grow-1 border d-flex align-items-center justify-content-center">
                    {t('example-textarea')}
                </div>
                <div className="p-1 m-1 flex-grow-1 border d-flex align-items-center justify-content-center">
                    {t('check-me-out')}
                </div>
            </div>

            <H2>{t('disabled-input')}</H2>
            <Text>
                <Trans i18nKey="disabled-select" components={{ '0': <Link to="https://learncssgrid.com/" /> }} />
            </Text>
            <div
                className="p-2 border overflow-hidden"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridAutoRows: '1fr',
                    gridGap: '0.5rem',
                    resize: 'both',
                    minWidth: '16rem',
                    height: '16rem',
                    minHeight: '6rem',
                    marginBottom: '16rem',
                }}
            >
                <div className="border d-flex align-items-center justify-content-center">{t('readonly-input')}</div>
                <div className="border d-flex align-items-center justify-content-center">{t('sizing')}</div>
                <div className="border d-flex align-items-center justify-content-center">{t('small-input')}</div>
                <div className="border d-flex align-items-center justify-content-center">{t('small-textarea')}</div>
                <div className="border d-flex align-items-center justify-content-center">{t('small-select')}</div>
                <div className="border d-flex align-items-center justify-content-center">{t('field-reference')}</div>
            </div>
        </>
    )
}

export const InputGroups: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/global-styles/GlobalStylesStory')

    return (
        <>
            <H1>{t('list-groups')}</H1>

            <Text>
                <Trans
                    i18nKey="list-groups-description"
                    components={{ '0': <Link to="https://getbootstrap.com/docs/4.5/components/input-group/" /> }}
                />
            </Text>

            <H2>{t('cras-justo-odio')}</H2>
            <div>
                <div className="input-group" style={{ maxWidth: '24rem' }}>
                    <Input type="search" placeholder={t('dapibus-ac-facilisis')} aria-label="Search query" />
                    <div className="input-group-append">
                        <Button type="submit" variant="primary">
                            {t('morbi-leo-risus')}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

InputGroups.storyName = 'Input groups'

export const Forms: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/global-styles/GlobalStylesStory')

    return (
        <>
            <H1>{t('porta-ac-consectetur')}</H1>
            <Text>
                <Trans
                    i18nKey="vestibulum-at-eros"
                    components={{
                        '0': (
                            <Link
                                to="https://getbootstrap.com/docs/4.5/components/forms/"
                                target="_blank"
                                rel="noopener noreferrer"
                            />
                        ),
                    }}
                />
            </Text>
            <Form onSubmit={preventDefault}>
                <Input
                    type="email"
                    id="example-email-input"
                    placeholder={t('interactive')}
                    label={t('meter')}
                    message="We'll never share your email with anyone else."
                    className="form-group"
                    inputClassName="mb-0"
                />
                <Input
                    type="password"
                    id="example-input-password"
                    className="form-group"
                    inputClassName="mb-0"
                    label={t('meter-element-description')}
                />

                <Select isCustomStyle={true} aria-label="Example select" label="Example select">
                    <option>{t('examples')}</option>
                    <option>{t('optimum')}</option>
                    <option>{t('sub-optimum')}</option>
                </Select>

                <div className="form-group">
                    <TextArea label={t('sub-sub-optimum')} id="example-textarea" rows={3} />
                </div>

                <Checkbox label={t('customize-with-controls')} wrapperClassName="mb-3" id="exampleCheck1" />

                <Button type="submit" variant="primary">
                    {t('')}
                </Button>
            </Form>

            <H2 className="mt-3">{t('')}</H2>
            <Form>
                <fieldset disabled={true}>
                    <Input
                        id="disabledTextInput"
                        placeholder={t('')}
                        className="form-group"
                        inputClassName="mb-0"
                        label={t('')}
                    />

                    <Select
                        isCustomStyle={true}
                        disabled={true}
                        label="Disabled select menu"
                        aria-label="Disabled select menu"
                    >
                        <option>{t('')}</option>
                    </Select>

                    <div className="form-group">
                        <Checkbox label={t('')} id="disabledFieldsetCheck" disabled={true} />
                    </div>
                    <Button type="submit" variant="primary">
                        {t('')}
                    </Button>
                </fieldset>
            </Form>

            <H2 className="mt-3">{t('')}</H2>
            <Input value="I'm a readonly value" readOnly={true} />
            <H2 className="mt-3">{t('')}</H2>
            <Text>{t('')}</Text>
            <div className="d-flex">
                <fieldset>
                    <div className="form-group">
                        <Input className="mb-1" placeholder={t('')} variant="small" />
                        <TextArea size="small" className="mb-1" placeholder={t('')} />
                        <Select
                            isCustomStyle={true}
                            selectSize="sm"
                            className="mb-0"
                            selectClassName="mb-1"
                            aria-label=""
                            id=""
                        >
                            <option>{t('')}</option>
                        </Select>
                    </div>
                </fieldset>
            </div>
            <H2 className="mt-3">{t('')}</H2>
            <FormFieldVariants />
        </>
    )
}

Forms.parameters = {
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/BkY8Ak997QauG0Iu2EqArv/Sourcegraph-Components?node-id=30%3A24',
    },
}

export const ListGroups: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/global-styles/GlobalStylesStory')

    return (
        <>
            <H1>{t('')}</H1>
            <Text>{t('')}</Text>
            <ul className="list-group mb-3">
                <li className="list-group-item">{t('')}</li>
                <li className="list-group-item">{t('')}</li>
                <li className="list-group-item">{t('')}</li>
                <li className="list-group-item">{t('')}</li>
                <li className="list-group-item">{t('')}</li>
            </ul>

            <H2>{t('')}</H2>
            <div className="list-group">
                <button
                    type="button"
                    className="list-group-item list-group-item-action active"
                    onClick={action('List group item clicked')}
                >
                    {t('')}
                </button>
                <button
                    type="button"
                    className="list-group-item list-group-item-action"
                    onClick={action('List group item clicked')}
                >
                    {t('')}
                </button>
                <button
                    type="button"
                    className="list-group-item list-group-item-action"
                    onClick={action('List group item clicked')}
                >
                    {t('')}
                </button>
                <button
                    type="button"
                    className="list-group-item list-group-item-action"
                    onClick={action('List group item clicked')}
                >
                    {t('')}
                </button>
                <button
                    type="button"
                    className="list-group-item list-group-item-action disabled"
                    tabIndex={-1}
                    aria-disabled="true"
                    onClick={action('List group item clicked')}
                >
                    {t('')}
                </button>
            </div>
        </>
    )
}

ListGroups.storyName = 'List groups'

export const Meter: StoryFn = args => {
    const { t } = useTranslation('../../wildcard/src/global-styles/GlobalStylesStory')

    return (
        <>
            <H1>{t('')}</H1>
            <Text>
                <Trans
                    i18nKey=""
                    values={{
                        codeMeterCode: (
                            <>
                                <Code>{'<meter>'}</Code>
                            </>
                        ),
                    }}
                    components={{
                        '0': (
                            <Link
                                to="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meter"
                                target="_blank"
                                rel="noopener noreferrer"
                            />
                        ),
                    }}
                />
            </Text>
            <H2>{t('')}</H2>
            <hr />
            <div className="pb-3">
                <H3>{t('')}</H3>
                <meter min={0} max={1} optimum={1} value={1} />
            </div>
            <hr />
            <div className="pb-3">
                <H3>{t('')}</H3>
                <meter min={0} max={1} high={0.8} low={0.2} optimum={1} value={0.6} />
            </div>
            <hr />
            <div className="pb-3">
                <H3>{t('')}</H3>
                <meter min={0} max={1} high={0.8} low={0.2} optimum={1} value={0.1} />
            </div>
            <hr />
            <div className="pb-3">
                <H3>{t('')}</H3>
                <meter {...args} />
            </div>
        </>
    )
}

Meter.argTypes = {
    min: {
        type: 'number',
    },
    max: {
        type: 'number',
    },
    high: {
        type: 'number',
    },
    low: {
        type: 'number',
    },
    optimum: {
        type: 'number',
    },
    value: {
        type: 'number',
    },
}
Meter.args = {
    min: 0,
    max: 1,
    high: 0.8,
    low: 0.2,
    optimum: 1,
    value: 0.1,
}
