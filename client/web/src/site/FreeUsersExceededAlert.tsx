import React, { useCallback, useEffect } from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { Alert, Link } from '@sourcegraph/wildcard'

interface Props extends TelemetryV2Props {
    noLicenseWarningUserCount: number | null
    className?: string
}

/**
 * A global alert that appears telling all users that they have exceeded the limit of free users allowed.
 */
export const FreeUsersExceededAlert: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    noLicenseWarningUserCount,
    className,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('site')

    useEffect(() => telemetryRecorder.recordEvent('alert.freeUsersExceeded', 'view'), [telemetryRecorder])
    const onClickCTA = useCallback(
        () => telemetryRecorder.recordEvent('alert.freeUsersExceeded.CTA', 'click'),
        [telemetryRecorder]
    )
    return (
        <Alert className={className} variant="danger">
            <Trans
                i18nKey="sourcegraph-instance-limit-warning"
                values={{
                    noLicenseWarningUserCount,
                    noLicenseWarningUserCountNull: noLicenseWarningUserCount === null,
                    spanClassNameUnderlineContactSourcegraphToStartAFreeTrialOrPurchaseALicenseSpan: (
                        <>
                            <span className="underline">
                                contact Sourcegraph to start a free trial or purchase a license
                            </span>
                        </>
                    ),
                }}
                components={{
                    '0': (
                        <Link
                            className="site-alert__link"
                            to="https://sourcegraph.com/contact/sales"
                            onClick={onClickCTA}
                        />
                    ),
                }}
            />
        </Alert>
    )
}
