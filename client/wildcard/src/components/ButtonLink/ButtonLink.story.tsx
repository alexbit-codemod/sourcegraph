import { mdiMagnify } from '@mdi/js'
import type { Meta, StoryFn } from '@storybook/react'
import { startCase } from 'lodash'
import { useTranslation } from 'react-i18next'

import { ButtonLink, H1, H2, Text } from '..'
import { BrandedStory } from '../../stories/BrandedStory'
import { BUTTON_VARIANTS } from '../Button/constants'
import { Grid } from '../Grid'
import { Icon } from '../Icon'

const Config: Meta = {
    title: 'wildcard/ButtonLink',

    decorators: [story => <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>],

    parameters: {
        component: ButtonLink,
        chromatic: {
            enableDarkMode: true,
            disableSnapshot: false,
        },
        design: [
            {
                type: 'figma',
                name: 'Figma Light',
                url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=908%3A2513',
            },
            {
                type: 'figma',
                name: 'Figma Dark',
                url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=908%3A5794',
            },
        ],
    },
}

export default Config

export const Overview: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/ButtonLink')

    return (
        <>
            <H1>ButtonLink</H1>
            <H2>{t('variants')}</H2>
            <Grid className="mb-3" columnCount={3}>
                {BUTTON_VARIANTS.map(variant => (
                    <div key={variant}>
                        <ButtonLink
                            variant={variant}
                            to="https://sourcegraph.com"
                            target="_blank"
                            onClick={console.log}
                        >
                            {startCase(variant)}
                        </ButtonLink>
                    </div>
                ))}
            </Grid>
            <H2>{t('outline')}</H2>
            <ButtonLink
                variant="danger"
                outline={true}
                to="https://sourcegraph.com"
                target="_blank"
                onClick={console.log}
                className="mb-2"
            >
                {t('outline-fragment')}
            </ButtonLink>
            <H2>{t('icons')}</H2>
            <Text>{t('icons-with-buttons')}</Text>{' '}
            <ButtonLink
                variant="secondary"
                to="https://sourcegraph.com"
                target="_blank"
                onClick={console.log}
                className="mb-2"
            >
                <Icon aria-hidden={true} className="mr-1" svgPath={mdiMagnify} />
                {t('search-fragment')}
            </ButtonLink>
            <H2>{t('smaller')}</H2>
            <Text>{t('smaller-buttons')}</Text>
            <ButtonLink
                variant="secondary"
                to="https://sourcegraph.com"
                target="_blank"
                onClick={console.log}
                className="mb-2"
                size="sm"
            >
                {t('smaller-fragment')}
            </ButtonLink>
        </>
    )
}
