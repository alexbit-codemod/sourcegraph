import { mdiClose } from '@mdi/js'
import type { StoryFn, Meta } from '@storybook/react'
import CloseIcon from 'mdi-react/CloseIcon'
import { useTranslation } from 'react-i18next'

import { Icon } from '..'
import { H3 } from '../..'
import { BrandedStory } from '../../stories/BrandedStory'
import { SourcegraphIcon } from '../SourcegraphIcon'
import { Code } from '../Typography'

const config: Meta = {
    title: 'wildcard/Icon',

    decorators: [story => <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>],

    parameters: {
        component: Icon,
        chromatic: {
            enableDarkMode: true,
            disableSnapshot: false,
        },
        design: {
            type: 'figma',
            name: 'Figma',
            url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=1366%3A611',
        },
    },
}
export default config

export const Simple: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Icon')

    return (
        <>
            <H3>{t('small-icon')}</H3>
            <Icon as={SourcegraphIcon} size="sm" aria-label="Sourcegraph logo" />

            <H3>{t('medium-icon')}</H3>
            <Icon as={SourcegraphIcon} size="md" aria-label="Sourcegraph logo" />

            <H3>
                {t('legacy-icon')}
                <Code>mdi-react</Code>
                {t('icon')}
            </H3>
            <Icon as={CloseIcon} size="md" aria-label="Close" />

            <H3>
                {t('new-icon')}
                <Code>{t('mdi-js')}</Code>
                {t('icon')}
            </H3>
            <Icon svgPath={mdiClose} size="md" aria-label="Close" />
        </>
    )
}
