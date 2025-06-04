import { useState } from 'react'

import { action } from '@storybook/addon-actions'
import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { Label } from '@sourcegraph/wildcard'
import { BrandedStory } from '@sourcegraph/wildcard/src/stories'

import { Toggle } from './Toggle'

const ToggleExample: typeof Toggle = ({ value, disabled, onToggle }) => {
    const { t } = useTranslation('../../branded/src/components')

    return (
        <div className="d-flex align-items-baseline mb-2">
            <Toggle
                value={value}
                onToggle={onToggle}
                disabled={disabled}
                title={t('greeting-hello')}
                className="mr-2"
            />
            <div>
                <Label className="mb-0">{t('toggle-status', { disabled, value })}</Label>
                <small className="field-message mt-0">{t('helper-text')}</small>
            </div>
        </div>
    )
}
const onToggle = action('onToggle')

const config: Meta = {
    title: 'branded/Toggle',
    decorators: [story => <BrandedStory>{() => <div className="container mt-3 pb-3">{story()}</div>}</BrandedStory>],
}

export default config

export const Interactive: StoryFn = () => {
    const [value, setValue] = useState(false)

    const onToggle = (value: boolean) => setValue(value)

    return <ToggleExample value={value} onToggle={onToggle} />
}

Interactive.parameters = {
    chromatic: {
        disable: true,
    },
}

export const Variants: StoryFn = () => (
    <>
        <ToggleExample value={true} onToggle={onToggle} />
        <ToggleExample value={false} onToggle={onToggle} />
        <ToggleExample value={true} disabled={true} onToggle={onToggle} />
        <ToggleExample value={false} disabled={true} onToggle={onToggle} />
    </>
)
