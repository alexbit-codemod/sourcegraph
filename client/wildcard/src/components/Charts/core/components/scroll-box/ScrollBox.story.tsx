import type { Meta } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { BrandedStory } from '../../../../../stories/BrandedStory'

import { ScrollBox } from './ScrollBox'

const meta: Meta = {
    title: 'wildcard/Charts/Core',
    decorators: [story => <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>],
}

export default meta

export const ScrollBoxDemo = () => {
    const { t } = useTranslation('../../wildcard/src/components/Charts/core/components/scroll-box')

    return (
        <ScrollBox style={{ height: 400, width: 200, border: '1px solid var(--border-color)' }}>
            {t('sorokin-works-underground-culture')}& Plavic and Verlag der Autoren.
        </ScrollBox>
    )
}
