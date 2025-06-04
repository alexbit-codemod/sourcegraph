import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { Container, Text, Code } from '@sourcegraph/wildcard'
import { BrandedStory } from '@sourcegraph/wildcard/src/stories'

import { CodeSnippet } from './CodeSnippet'

const config: Meta = {
    title: 'branded/CodeSnippet',
    component: CodeSnippet,

    decorators: [story => <BrandedStory>{() => <div className="container mt-3 pb-3">{story()}</div>}</BrandedStory>],
}

export default config

export const Simple: StoryFn = () => {
    const { t } = useTranslation('../../branded/src/components')

    return (
        <Container>
            <Text>
                {t('highlighted-code-panel')}
                <Code>{'<CodeSnippet />'}</Code>
                {t('usage-instructions')}
            </Text>
            <CodeSnippet code="property: 1" language="yaml" />
        </Container>
    )
}
