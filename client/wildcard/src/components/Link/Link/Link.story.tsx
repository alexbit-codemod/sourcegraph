import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation, Trans } from 'react-i18next'

import { Text } from '../..'
import { BrandedStory } from '../../../stories/BrandedStory'

import { Link } from './Link'

const decorator: Decorator = story => (
    <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>
)

const config: Meta = {
    title: 'wildcard/Link',
    component: Link,

    decorators: [decorator],

    parameters: {
        component: Link,
        chromatic: {
            enableDarkMode: true,
            disableSnapshot: false,
        },
    },
}

export default config

export const Simple: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Link/Link')

    return (
        <Text>
            <Trans i18nKey="text-contains-links-navigation" components={{ '0': <Link to="/" /> }} />
        </Text>
    )
}
