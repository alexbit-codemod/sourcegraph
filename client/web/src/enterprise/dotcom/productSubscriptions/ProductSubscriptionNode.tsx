import * as React from 'react'

import { useTranslation } from 'react-i18next'

import { gql } from '@sourcegraph/http-client'
import { Link } from '@sourcegraph/wildcard'

import type { ProductSubscriptionFields } from '../../../graphql-operations'

import { ProductSubscriptionLabel } from './ProductSubscriptionLabel'

export const productSubscriptionFragment = gql`
    fragment ProductSubscriptionFields on ProductSubscription {
        id
        name
        account {
            id
            username
            displayName
        }
        activeLicense {
            licenseKey
            info {
                productNameWithBrand
                tags
                userCount
                expiresAt
            }
        }
        createdAt
        isArchived
        url
    }
`

export const ProductSubscriptionNodeHeader: React.FunctionComponent<React.PropsWithChildren<unknown>> = () => {
    const { t } = useTranslation('enterprise/dotcom/productSubscriptions')

    return (
        <thead>
            <tr>
                <th>{t('identifier')}</th>
                <th>{t('subscription-plan')}</th>
            </tr>
        </thead>
    )
}

export interface ProductSubscriptionNodeProps {
    node: ProductSubscriptionFields
}

export const ProductSubscriptionNode: React.FunctionComponent<
    React.PropsWithChildren<ProductSubscriptionNodeProps>
> = ({ node }) => (
    <tr>
        <td className="text-nowrap">
            <Link to={node.url} className="mr-3 font-weight-bold">
                {node.name}
            </Link>
        </td>
        <td className="w-100">
            <ProductSubscriptionLabel productSubscription={node} className="mr-3" />
        </td>
    </tr>
)
