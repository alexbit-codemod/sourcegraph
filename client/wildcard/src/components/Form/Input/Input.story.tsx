import React, { useCallback } from 'react'

import type { Meta } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { BrandedStory } from '../../../stories/BrandedStory'

import { Input, InputDescription, InputElement, InputErrorMessage, InputStatus, Label } from './Input'

const Story: Meta = {
    title: 'wildcard/Input',

    decorators: [story => <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>],

    parameters: {
        component: Input,
        chromatic: {
            enableDarkMode: true,
            disableSnapshot: false,
        },
        design: {
            type: 'figma',
            name: 'Figma',
            url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=875%3A797',
        },
    },
}

export default Story

export const Simple = () => {
    const { t } = useTranslation('../../wildcard/src/components/Form/Input')

    const [selected, setSelected] = React.useState('')

    const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(event => {
        setSelected(event.target.value)
    }, [])

    return (
        <>
            <Input label={t('input-raw')} value={selected} onChange={handleChange} />
            <Input
                value={selected}
                label={t('input-valid')}
                onChange={handleChange}
                message="random message"
                status="valid"
                disabled={false}
                placeholder={t('testing-this-one-1')}
            />
            <Input
                value={selected}
                label={t('input-loading')}
                onChange={handleChange}
                message="random message"
                status="loading"
                placeholder={t('loading-status-input')}
            />
            <Input
                value={selected}
                label={t('input-error')}
                onChange={handleChange}
                error="An error message that can contain `code` or other **Markdown** _formatting_. [Learn more](https://sourcegraph.com/docs)"
                status="error"
                placeholder={t('error-status-input')}
            />
            <Input
                value={selected}
                label={t('disabled-input')}
                onChange={handleChange}
                message="random message"
                disabled={true}
                placeholder={t('disable-status-input')}
            />

            <Input
                value={selected}
                label={t('input-small')}
                onChange={handleChange}
                message="random message"
                status="valid"
                disabled={false}
                placeholder={t('testing-this-one-2')}
                variant="small"
            />

            <section>
                <Label htmlFor="customInput">{t('custom-label-layout')}</Label>
                <InputElement
                    id="customInput"
                    placeholder={t('field-with-custom-label-layout')}
                    status={InputStatus.error}
                />
                <InputErrorMessage message="Input custom error message" className="mt-2" />
                <InputDescription className="mt-2">
                    <ul>
                        <li>{t('hint-regular-expressions-filters')}</li>
                        <li>{t('datapoints-backfilled-info')}</li>
                    </ul>
                </InputDescription>
            </section>
        </>
    )
}
