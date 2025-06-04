import type { Meta } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { H1, H2, Text } from '..'
import { BrandedStory } from '../../stories/BrandedStory'

import { PRODUCT_STATUSES } from './constants'
import { ProductStatusBadge } from './ProductStatusBadge'

const config: Meta = {
    title: 'wildcard/ProductStatusBadge',

    decorators: [story => <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>],

    parameters: {
        component: ProductStatusBadge,
        chromatic: {
            enableDarkMode: true,
            disableSnapshot: false,
        },
        design: [
            {
                type: 'figma',
                name: 'Figma Light',
                url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=908%3A6149',
            },

            {
                type: 'figma',
                name: 'Figma Dark',
                url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=908%3A6447',
            },
        ],
    },
}

export default config

export const Badges = () => {
    const { t } = useTranslation('../../wildcard/src/components/Badge')

    return (
        <>
            <H1>{t('product-status-badges')}</H1>
            <Text>{t('product-badges-description')}</Text>
            {PRODUCT_STATUSES.map(status => (
                <ProductStatusBadge key={status} status={status} className="mr-2" />
            ))}
            <H2 className="mt-4">{t('linked-product-status-badges')}</H2>
            <Text>{t('linked-product-badges-description')}</Text>
            <ProductStatusBadge status="beta" linkToDocs={true} className="mr-3" />
            <ProductStatusBadge status="experimental" linkToDocs={true} className="mr-3" />
        </>
    )
}
