import React, { useCallback } from 'react'

import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { H1, H2 } from '../..'
import { BrandedStory } from '../../../stories/BrandedStory'
import { Grid } from '../../Grid/Grid'

import { Select, type SelectProps } from './Select'

const config: Meta = {
    title: 'wildcard/Select',

    decorators: [story => <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>],

    parameters: {
        component: Select,
        design: {
            type: 'figma',
            name: 'Figma',
            url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=854%3A1630',
        },
    },
}

export default config

const BaseSelect = (props: { id: string } & Pick<SelectProps, 'isCustomStyle' | 'isValid' | 'disabled'>) => {
    const { t } = useTranslation('../../wildcard/src/components/Form/Select')

    const [selected, setSelected] = React.useState('')

    const handleChange = useCallback<React.ChangeEventHandler<HTMLSelectElement>>(event => {
        setSelected(event.target.value)
    }, [])

    return (
        <Select
            label="What is your favorite fruit?"
            message="I am a message"
            description="I am a description"
            value={selected}
            onChange={handleChange}
            {...props}
        >
            <option value="">{t('favorite-fruit')}</option>
            <option value="apples">{t('apples')}</option>
            <option value="bananas">{t('bananas')}</option>
            <option value="oranges">{t('oranges')}</option>
        </Select>
    )
}

const SelectVariants = ({ isCustomStyle }: Pick<SelectProps, 'isCustomStyle'>) => {
    const { t } = useTranslation('../../wildcard/src/components/Form/Select')

    const idPrefix = isCustomStyle ? 'custom' : 'native'
    return (
        <Grid columnCount={4}>
            <div>
                <H2>{t('standard')}</H2>
                <BaseSelect id={`${idPrefix}-standard`} isCustomStyle={isCustomStyle} />
            </div>
            <div>
                <H2>{t('valid')}</H2>
                <BaseSelect id={`${idPrefix}-valid`} isCustomStyle={isCustomStyle} isValid={true} />
            </div>
            <div>
                <H2>{t('invalid')}</H2>
                <BaseSelect id={`${idPrefix}-invalid`} isCustomStyle={isCustomStyle} isValid={false} />
            </div>
            <div>
                <H2>{t('disabled')}</H2>
                <BaseSelect id={`${idPrefix}-disabled`} isCustomStyle={isCustomStyle} disabled={true} />
            </div>
        </Grid>
    )
}

export const SelectExamples: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Form/Select')

    return (
        <>
            <H1>{t('select')}</H1>
            <H2>{t('native')}</H2>
            <SelectVariants />
            <H2>{t('custom')}</H2>
            <SelectVariants isCustomStyle={true} />
        </>
    )
}

SelectExamples.parameters = {
    chromatic: {
        enableDarkMode: true,
        disableSnapshot: false,
    },
}
