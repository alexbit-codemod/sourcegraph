import React from 'react'

import { useTranslation } from 'react-i18next'

import { Link } from '@sourcegraph/wildcard'

import type { ProductLicenseSubscriptionAccount } from '../../../graphql-operations'
import { userURL } from '../../../user'

/**
 * Displays the account name as a link.
 */
export const AccountName: React.FunctionComponent<
    React.PropsWithChildren<{
        account: Pick<ProductLicenseSubscriptionAccount, 'username' | 'displayName'> | null
        link?: string
    }>
> = ({ account, link }) => {
    const { t } = useTranslation('enterprise/dotcom/productSubscriptions')

    return account ? (
        <>
            <Link to={link || userURL(account.username)}>{account.username}</Link>{' '}
            {account.displayName && `(${account.displayName})`}
        </>
    ) : (
        <em>{t('account-deleted')}</em>
    )
}
