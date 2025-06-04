import React, { useCallback, useEffect } from 'react'

import classNames from 'classnames'
import { formatDistanceStrict } from 'date-fns'
import { useTranslation, Trans } from 'react-i18next'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { Link } from '@sourcegraph/wildcard'

import { DismissibleAlert } from '../components/DismissibleAlert'
import { isProductLicenseExpired, formatRelativeExpirationDate } from '../productSubscription/helpers'

interface Props extends TelemetryV2Props {
    className?: string
    daysLeft: number
    expiresAt: Date
}

/**
 * A global alert that appears telling the site admin that their license key is about to expire. Even after being dismissed,
 * it reappears every day.
 */
export const LicenseExpirationAlert: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    expiresAt,
    daysLeft,
    className,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('site')

    useEffect(() => telemetryRecorder.recordEvent('alert.licenseExpiration', 'view'), [telemetryRecorder])
    const onClickRenewCTA = useCallback(
        () => telemetryRecorder.recordEvent('alert.licenseExpiration.RenewCTA', 'click'),
        [telemetryRecorder]
    )
    const onClickContactCTA = useCallback(
        () => telemetryRecorder.recordEvent('alert.licenseExpiration.ContactCTA', 'click'),
        [telemetryRecorder]
    )

    return (
        <DismissibleAlert
            partialStorageKey={`licenseExpiring.${daysLeft}`}
            variant="warning"
            className={classNames('align-items-center', className)}
        >
            <Trans
                i18nKey="license-expiration-notice"
                values={{
                    formatRelativeExpirationDateExpiresAt: formatRelativeExpirationDate(expiresAt),
                    formatDistanceStrictExpiresAtDateNow: formatDistanceStrict(expiresAt, Date.now()),
                    isProductLicenseExpiredExpiresAt: isProductLicenseExpired(expiresAt),
                    spanClassNameUnderlineRenewNowSpan: (
                        <>
                            <span className="underline">Renew now</span>
                        </>
                    ),
                    spanClassNameUnderlineContactSourcegraphSpan: (
                        <>
                            <span className="underline">contact Sourcegraph</span>
                        </>
                    ),
                }}
                components={{
                    '0': <Link className="site-alert__link" to="/site-admin/license" onClick={onClickRenewCTA} />,
                    '1': (
                        <Link
                            className="site-alert__link"
                            to="https://sourcegraph.com/contact"
                            onClick={onClickContactCTA}
                        />
                    ),
                }}
            />
        </DismissibleAlert>
    )
}
