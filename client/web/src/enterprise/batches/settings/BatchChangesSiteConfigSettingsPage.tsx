import React, { useEffect } from 'react'

import { useTranslation, Trans } from 'react-i18next'

import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { PageHeader, Alert, Text } from '@sourcegraph/wildcard'

import { PageTitle } from '../../../components/PageTitle'

import { GlobalCodeHostConnections } from './CodeHostConnections'
import { GlobalCommitSigningIntegrations } from './CommitSigningIntegrations'
import { RolloutWindowsConfiguration } from './RolloutWindowsConfiguration'

interface BatchChangesSiteConfigSettingsPageProps extends TelemetryV2Props {}

/** The page area for all batch changes settings. It's shown in the site admin settings sidebar. */
export const BatchChangesSiteConfigSettingsPage: React.FunctionComponent<BatchChangesSiteConfigSettingsPageProps> = ({
    telemetryRecorder,
}) => {
    const { t } = useTranslation('enterprise/batches/settings')

    useEffect(() => telemetryRecorder.recordEvent('admin.batchChangesSettings', 'view'), [telemetryRecorder])
    return (
        <>
            <PageTitle title={t('batch-changes-settings-title')} />
            <PageHeader headingElement="h2" path={[{ text: 'Batch Changes settings' }]} className="mb-3" />
            <RolloutWindowsConfiguration />
            <GlobalCodeHostConnections
                headerLine={
                    <>
                        <Text>{t('add-access-tokens-batch-changes')}</Text>
                        <Alert variant="info">
                            <Trans
                                i18nKey="configuring-global-credentials-batch-changes"
                                components={{ '0': <strong /> }}
                            />
                        </Alert>
                    </>
                }
            />
            <GlobalCommitSigningIntegrations />
        </>
    )
}
