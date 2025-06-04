import React from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { Text, Alert, Link } from '@sourcegraph/wildcard'

import { CopyableText } from '../../components/CopyableText'

interface AccountCreatedAlertProps {
    username: string
    email?: string
    resetPasswordURL?: string | null
}

/**
 * An alert component that displays a message indicating that an account has been created.
 * - Shows a reset password URL in Copyable text if one is provided.
 * - Shows a link to the user's profile page.
 * - Shows a different message depending on whether email provided and email sending is enabled.
 */
export const AccountCreatedAlert: React.FunctionComponent<React.PropsWithChildren<AccountCreatedAlertProps>> = ({
    username,
    email,
    resetPasswordURL,
    children,
}) => {
    const { t } = useTranslation('site-admin/components')

    return (
        <Alert variant="success">
            <Text>
                <Trans
                    i18nKey="account-created-for-user-link"
                    values={{ username: <>{username}</> }}
                    components={{ '0': <Link to={`/users/${username}`} /> }}
                />
            </Text>
            <Text>
                {resetPasswordURL
                    ? window.context.emailEnabled && email
                        ? "A password reset URL has been sent to the new user's email address. If they don't receive it, you can also share the following password reset link: "
                        : 'You must manually send this password reset link to the new user: '
                    : 'The user must authenticate using a configured authentication provider.'}
            </Text>
            {resetPasswordURL && <CopyableText text={resetPasswordURL} size={40} />}
            {children}
        </Alert>
    )
}
