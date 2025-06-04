import { type FC, useState } from 'react'

import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { SearchPatternType } from '@sourcegraph/shared/src/graphql-operations'
import { H2 } from '@sourcegraph/wildcard'
import { BrandedStory } from '@sourcegraph/wildcard/src/stories'

import { BaseCodeMirrorQueryInput, type BaseCodeMirrorQueryInputProps } from './BaseCodeMirrorQueryInput'

const config: Meta = {
    title: 'branded/search-ui/input/BaseCodeMirrorQueryInput',
    parameters: {
        chromatic: { viewports: [500] },
    },
}

export default config

const defaultProps: BaseCodeMirrorQueryInputProps = {
    value: 'r:sourcegraph/.* test [a-z]* /is this a regex?/ author:me',
    interpretComments: false,
    patternType: SearchPatternType.standard,
}

const multiLineValue = `
this is the first line


two empty lines above this one

last line
`

const QueryInputStory: FC<{}> = () => {
    const { t } = useTranslation('../../branded/src/search-ui/input')

    const [counter, setCounter] = useState(0)
    const [onChange, setOnChange] = useState('')

    return (
        <>
            <div className="m-3">
                <H2>{t('literal-search-pattern')}</H2>
                <BaseCodeMirrorQueryInput {...defaultProps} patternType={SearchPatternType.literal} />
            </div>
            <div className="m-3">
                <H2>{t('regexp-search-pattern')}</H2>
                <BaseCodeMirrorQueryInput {...defaultProps} patternType={SearchPatternType.regexp} />
            </div>
            <div className="m-3">
                <H2>{t('standard-search-pattern-1')}</H2>
                <BaseCodeMirrorQueryInput {...defaultProps} patternType={SearchPatternType.standard} />
            </div>
            <div className="m-3">
                <H2>{t('standard-search-pattern-2')}</H2>
                <BaseCodeMirrorQueryInput {...defaultProps} patternType={SearchPatternType.standard} />
            </div>
            <div className="m-3">
                <H2>{t('auto-focus-true')}</H2>
                <BaseCodeMirrorQueryInput {...defaultProps} autoFocus={true} patternType={SearchPatternType.standard} />
            </div>
            <div className="m-3">
                <H2>{t('read-only-true')}</H2>
                <BaseCodeMirrorQueryInput {...defaultProps} readOnly={true} patternType={SearchPatternType.standard} />
            </div>
            <div className="m-3">
                <H2>{t('multi-line-true')}</H2>
                <BaseCodeMirrorQueryInput
                    {...defaultProps}
                    value={multiLineValue}
                    multiLine={true}
                    patternType={SearchPatternType.standard}
                />
            </div>
            <div className="m-3">
                <H2>{t('multi-line-false-default')}</H2>
                <BaseCodeMirrorQueryInput
                    {...defaultProps}
                    value={multiLineValue}
                    patternType={SearchPatternType.standard}
                />
            </div>
            <div className="m-3">
                <H2>{t('event-handlers')}</H2>
                <BaseCodeMirrorQueryInput
                    {...defaultProps}
                    patternType={SearchPatternType.standard}
                    onEnter={() => {
                        setCounter(count => count + 1)
                        return true
                    }}
                    onChange={setOnChange}
                />
                <div>{t('on-enter-pressed', { counter })}</div>
                <div>{t('on-change-handler', { onChange })}</div>
            </div>
        </>
    )
}

export const Default: StoryFn = () => <BrandedStory>{QueryInputStory}</BrandedStory>
