import React from 'react'

import { useTranslation } from 'react-i18next'

import type { ProductSubscriptionFields, SiteAdminProductSubscriptionFields } from '../../../graphql-operations'
import { formatUserCount } from '../../../productSubscription/helpers'

/**
 * Displays a text label with the product name (e.g., "Sourcegraph Enterprise") and user count for the
 * subscription.
 */
export const ProductSubscriptionLabel: React.FunctionComponent<
    React.PropsWithChildren<{
        productSubscription: ProductSubscriptionFields | SiteAdminProductSubscriptionFields
        className?: string
    }>
> = ({ productSubscription, className = '' }) => {
    const { t } = useTranslation('enterprise/dotcom/productSubscriptions')

    return (
        <span className={className}>
            {productSubscription.activeLicense?.info ? (
                <>
                    {productSubscription.activeLicense.info.productNameWithBrand} (
                    {formatUserCount(productSubscription.activeLicense.info.userCount)})
                </>
            ) : (
                <span className="text-muted font-italic">{t('no-plan-selected')}</span>
            )}
        </span>
    )
}
