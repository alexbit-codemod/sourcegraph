import React from 'react'

import { useTranslation } from 'react-i18next'

import { H4, Text } from '@sourcegraph/wildcard'

import { DismissibleAlert } from '../DismissibleAlert'

export const GitHubAppFailureAlert: React.FunctionComponent<React.PropsWithChildren<{ error: string }>> = ({
    error,
}) => {
    const { t } = useTranslation('components/gitHubApps')

    return (
        <DismissibleAlert className="mb-3" variant="danger">
            <div>
                <H4>{t('github-app-connection-error')}</H4>
                <Text className="m-0">{t('setup-error-occurred', { error })}</Text>
                <Text className="m-0">{t('remove-github-app-retry')}</Text>
            </div>
        </DismissibleAlert>
    )
}
