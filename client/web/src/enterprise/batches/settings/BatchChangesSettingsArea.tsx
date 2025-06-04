import React from 'react'

import { useTranslation } from 'react-i18next'

import { PageHeader, Text } from '@sourcegraph/wildcard'

import { PageTitle } from '../../../components/PageTitle'
import type { UserAreaUserFields } from '../../../graphql-operations'

import { UserCodeHostConnections } from './CodeHostConnections'
import { UserCommitSigningIntegrations } from './CommitSigningIntegrations'
import { RolloutWindowsConfiguration } from './RolloutWindowsConfiguration'

export interface BatchChangesSettingsAreaProps {
    user: UserAreaUserFields
}

/** The page area for all batch changes settings. It's shown in the user settings sidebar. */
export const BatchChangesSettingsArea: React.FunctionComponent<
    React.PropsWithChildren<BatchChangesSettingsAreaProps>
> = props => {
    const { t } = useTranslation('enterprise/batches/settings')

    return (
        <div className="test-batches-settings-page">
            <PageTitle title={t('batch-changes-settings')} />
            <PageHeader headingElement="h2" path={[{ text: 'Batch Changes settings' }]} className="mb-3" />
            <RolloutWindowsConfiguration />
            <UserCodeHostConnections
                headerLine={<Text>{t('add-access-tokens-batch-changes')}</Text>}
                user={props.user}
            />
            <UserCommitSigningIntegrations userID={props.user.id} />
        </div>
    )
}
