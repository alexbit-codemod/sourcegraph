import React, { useCallback, useEffect } from 'react'

import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { Link } from '@sourcegraph/wildcard'

import { DismissibleAlert } from '../components/DismissibleAlert'
import { PageRoutes } from '../routes.constants'

interface Props extends TelemetryV2Props {
    className?: string
}

/**
 * A global alert telling the site admin that they need to configure repositories
 * on this site.
 */
export const NeedsRepositoryConfigurationAlert: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    className,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('site')

    useEffect(() => telemetryRecorder.recordEvent('alert.needsRepoConfig', 'view'), [telemetryRecorder])
    const onClickCTA = useCallback(
        () => telemetryRecorder.recordEvent('alert.needsRepoConfig.CTA', 'click'),
        [telemetryRecorder]
    )
    return (
        <DismissibleAlert
            partialStorageKey="needsRepositoryConfiguration"
            variant="success"
            className={classNames('d-flex align-items-center', className)}
        >
            <Trans
                i18nKey="link-to-setup-wizard"
                values={{
                    spanClassNameUnderlineGoToSetupWizardSpan: (
                        <>
                            <span className="underline">Go to setup wizard</span>
                        </>
                    ),
                }}
                components={{
                    '0': (
                        <Link
                            className="site-alert__link"
                            to={`${PageRoutes.SetupWizard}/remote-repositories`}
                            onClick={onClickCTA}
                        />
                    ),
                }}
            />
        </DismissibleAlert>
    )
}
