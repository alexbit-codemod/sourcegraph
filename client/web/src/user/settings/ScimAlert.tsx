import { useTranslation, Trans } from 'react-i18next'

import { Alert, Link, Text } from '@sourcegraph/wildcard'

export const ScimAlert = (): JSX.Element => {
    const { t } = useTranslation('user/settings')

    return (
        <Alert className="mb-4" variant="info">
            <Text className="mb-0">
                <Trans
                    i18nKey="profile-managed-by-identity-provider"
                    components={{ '0': <Link to="/help/admin/scim" className="text-nowrap" /> }}
                />
            </Text>
        </Alert>
    )
}
