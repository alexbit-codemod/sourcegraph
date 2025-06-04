import { type ReactElement, useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { Text } from '@sourcegraph/wildcard'

import { SiteAdminRepositoriesContainer } from '../../site-admin/SiteAdminRepositoriesContainer'

import { CustomNextButton } from './setup-steps'

interface SyncRepositoriesStepProps extends TelemetryProps, TelemetryV2Props {
    baseURL: string
}

export function SyncRepositoriesStep({
    telemetryService,
    telemetryRecorder,
    baseURL,
    ...attributes
}: SyncRepositoriesStepProps): ReactElement {
    const { t } = useTranslation('setup-wizard/components')

    useEffect(() => {
        telemetryService.log('SetupWizardLandedSyncRepositories')
        telemetryRecorder.recordEvent('setupWizard.syncRepos', 'view')
    }, [telemetryService, telemetryRecorder])

    const handleFinishButtonClick = (): void => {
        telemetryService.log('SetupWizardFinishedSuccessfully')
        telemetryRecorder.recordEvent('setupWizard', 'finish')
    }

    return (
        <section {...attributes}>
            <Text className="mb-2">{t('cloning-indexing-repositories-message')}</Text>
            <SiteAdminRepositoriesContainer alwaysPoll={true} />

            <CustomNextButton label={t('start-searching-button')} disabled={false} onClick={handleFinishButtonClick} />
        </section>
    )
}
