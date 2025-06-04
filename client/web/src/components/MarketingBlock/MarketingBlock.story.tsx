import { mdiArrowRight } from '@mdi/js'
import type { Decorator, Meta } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { Link, Icon, H2, H3, Grid } from '@sourcegraph/wildcard'

import { WebStory } from '../WebStory'

import { MarketingBlock } from './MarketingBlock'

const decorator: Decorator = story => <WebStory>{() => <div className="container mt-3">{story()}</div>}</WebStory>

const config: Meta = {
    title: 'web/marketing/MarketingBlock',
    decorators: [decorator],
}

export default config

export const Default = (): JSX.Element => {
    const { t } = useTranslation('components/MarketingBlock')

    return (
        <Grid columnCount={2}>
            <H2>{t('default-message')}</H2>
            <H2>{t('variant-thin')}</H2>
            <MarketingBlock>
                <H3 className="pr-3">{t('need-help-getting-started')}</H3>
                <div>
                    <Link to="https://sourcegraph.com/search">
                        {t('speak-to-engineer-1')}
                        <Icon className="ml-2" aria-hidden={true} svgPath={mdiArrowRight} />
                    </Link>
                </div>
            </MarketingBlock>{' '}
            <MarketingBlock variant="thin">
                <H3 className="pr-3">{t('need-help-getting-started-duplicate')}</H3>
                <div>
                    <Link to="https://sourcegraph.com/search">
                        {t('speak-to-engineer-2')}
                        <Icon className="ml-2" aria-hidden={true} svgPath={mdiArrowRight} />
                    </Link>
                </div>
            </MarketingBlock>
        </Grid>
    )
}
