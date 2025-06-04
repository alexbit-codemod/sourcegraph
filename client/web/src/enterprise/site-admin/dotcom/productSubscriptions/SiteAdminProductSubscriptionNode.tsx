import * as React from 'react'

import { useTranslation } from 'react-i18next'

import { Timestamp } from '@sourcegraph/branded/src/components/Timestamp'
import { LinkOrSpan } from '@sourcegraph/wildcard'

import type { SiteAdminProductSubscriptionFields } from '../../../../graphql-operations'
import { AccountName } from '../../../dotcom/productSubscriptions/AccountName'
import { ProductSubscriptionLabel } from '../../../dotcom/productSubscriptions/ProductSubscriptionLabel'
import { ProductLicenseTags } from '../../../productSubscription/ProductLicenseTags'

import { enterprisePortalID } from './utils'

export const SiteAdminProductSubscriptionNodeHeader: React.FunctionComponent<React.PropsWithChildren<unknown>> = () => {
    const { t } = useTranslation('enterprise/site-admin/dotcom/productSubscriptions')

    return (
        <thead>
            <tr>
                <th>{t('id')}</th>
                <th>{t('customer')}</th>
                <th>{t('plan')}</th>
                <th>{t('expiration')}</th>
                <th>{t('tags')}</th>
            </tr>
        </thead>
    )
}

export interface SiteAdminProductSubscriptionNodeProps {
    node: SiteAdminProductSubscriptionFields
}

/**
 * Displays a product subscription in a connection in the site admin area.
 */
export const SiteAdminProductSubscriptionNode: React.FunctionComponent<
    React.PropsWithChildren<SiteAdminProductSubscriptionNodeProps>
> = ({ node }) => {
    const { t } = useTranslation('enterprise/site-admin/dotcom/productSubscriptions')

    return (
        <tr>
            <td>
                <LinkOrSpan to={node.urlForSiteAdmin} className="mr-3">
                    {enterprisePortalID(node.uuid)}
                </LinkOrSpan>
            </td>
            <td className="w-100">
                <AccountName account={node.account} />
            </td>
            <td className="text-nowrap">
                <ProductSubscriptionLabel productSubscription={node} className="mr-3" />
            </td>
            <td className="text-nowrap">
                {node.activeLicense?.info ? (
                    <Timestamp date={node.activeLicense.info.expiresAt} utc={true} />
                ) : (
                    <span className="text-muted font-italic">{t('none')}</span>
                )}
            </td>
            <td className="w-100">
                {node.activeLicense?.info && node.activeLicense.info.tags.length > 0 ? (
                    <ProductLicenseTags tags={node.activeLicense.info.tags} />
                ) : (
                    <span className="text-muted font-italic">{t('none')}</span>
                )}
            </td>
        </tr>
    )
}
