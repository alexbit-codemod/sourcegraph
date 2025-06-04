import React, { useMemo, type FC } from 'react'

import classNames from 'classnames'
import { parseISO } from 'date-fns'
import { useTranslation, Trans } from 'react-i18next'
import type { Observable } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { asError, type ErrorLike, isErrorLike } from '@sourcegraph/common'
import { gql, dataOrThrowErrors } from '@sourcegraph/http-client'
import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import {
    LoadingSpinner,
    useObservable,
    Link,
    CardFooter,
    Alert,
    ButtonLink,
    Tooltip,
    ErrorAlert,
    Text,
} from '@sourcegraph/wildcard'

import { queryGraphQL } from '../../../backend/graphql'
import type { ProductLicenseInfoResult } from '../../../graphql-operations'
import { formatUserCount } from '../../../productSubscription/helpers'
import { ExpirationDate } from '../../productSubscription/ExpirationDate'
import { ProductCertificate } from '../../productSubscription/ProductCertificate'
import { TrueUpStatusSummary } from '../../productSubscription/TrueUpStatusSummary'
import { TAG_TRUEUP } from '../dotcom/productSubscriptions/plandata'

const queryProductLicenseInfo = (): Observable<{
    productSubscription: ProductLicenseInfoResult['site']['productSubscription']
    currentUserCount: number
}> =>
    queryGraphQL<ProductLicenseInfoResult>(gql`
        query ProductLicenseInfo {
            site {
                productSubscription {
                    productNameWithBrand
                    actualUserCount
                    actualUserCountDate
                    noLicenseWarningUserCount
                    license {
                        ...ProductLicenseInfoLicenseFields
                    }
                }
            }
            users {
                totalCount
            }
        }
        fragment ProductLicenseInfoLicenseFields on ProductLicenseInfo {
            isFreePlan
            tags
            userCount
            expiresAt
            isValid
            licenseInvalidityReason
        }
    `).pipe(
        map(dataOrThrowErrors),
        map(({ site, users }) => ({
            productSubscription: site.productSubscription,
            currentUserCount: users.totalCount,
        }))
    )

interface Props extends TelemetryV2Props {
    className?: string
}

/**
 * A component displaying information about and the status of the product subscription.
 */
export const ProductSubscriptionStatus: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    className,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('enterprise/site-admin/productSubscription')

    /** The product subscription status, or an error, or undefined while loading. */
    const statusOrError = useObservable(
        useMemo(() => queryProductLicenseInfo().pipe(catchError((error): [ErrorLike] => [asError(error)])), [])
    )
    if (statusOrError === undefined) {
        return (
            <div className="text-center">
                <LoadingSpinner />
            </div>
        )
    }
    if (isErrorLike(statusOrError)) {
        return <ErrorAlert error={statusOrError} prefix="Error checking product license" />
    }

    const {
        productSubscription: {
            productNameWithBrand,
            actualUserCount,
            actualUserCountDate,
            noLicenseWarningUserCount,
            license,
        },
        currentUserCount,
    } = statusOrError

    const hasTrueUp = license?.tags.some(tag => tag === TAG_TRUEUP.tagValue)

    const numberFormatter = Intl.NumberFormat(navigator.language)

    // No license means Sourcegraph Free. For that, show the user that they can use this for free
    // forever, and show them how to upgrade.

    return (
        <div>
            <ProductCertificate
                title={productNameWithBrand}
                detail={<LicenseDetails license={license} />}
                footer={
                    <CardFooter className="d-flex align-items-center justify-content-between">
                        {!license.isFreePlan ? (
                            <>
                                <div>
                                    <strong>User licenses:</strong> {numberFormatter.format(currentUserCount)}
                                    {t('currently-used')}
                                    {numberFormatter.format(license.userCount - currentUserCount)}
                                    {t('remaining-users')}
                                    {numberFormatter.format(actualUserCount)}
                                    {t('maximum-ever-used')}
                                </div>
                                <ButtonLink
                                    to="https://sourcegraph.com/pricing"
                                    target="_blank"
                                    rel="noopener"
                                    variant="primary"
                                    size="sm"
                                    onClick={() =>
                                        telemetryRecorder.recordEvent('admin.productSubscription.upgradeCTA', 'click', {
                                            metadata: { location: 0 },
                                        })
                                    }
                                >
                                    {t('upgrade-license')}
                                </ButtonLink>
                            </>
                        ) : (
                            <>
                                <div className="mr-2">
                                    {t('add-license-key-warning', {
                                        noLicenseWarningUserCount,
                                        typeofNoLicenseWarningUserCountNumber:
                                            typeof noLicenseWarningUserCount === 'number',
                                    })}
                                </div>
                                <div className="text-nowrap flex-wrap-reverse">
                                    <Tooltip content="Buy a Sourcegraph Enterprise subscription to get a license key">
                                        <ButtonLink
                                            to="http://sourcegraph.com/contact/sales"
                                            target="_blank"
                                            rel="noopener"
                                            variant="primary"
                                            size="sm"
                                            onClick={() =>
                                                telemetryRecorder.recordEvent(
                                                    'admin.productSubscription.enterpriseCTA',
                                                    'click'
                                                )
                                            }
                                        >
                                            {t('get-license-button')}
                                        </ButtonLink>
                                    </Tooltip>
                                </div>
                            </>
                        )}
                    </CardFooter>
                }
                className={classNames('mb-3', className)}
            />

            {hasTrueUp && (
                <TrueUpStatusSummary
                    actualUserCount={actualUserCount}
                    actualUserCountDate={actualUserCountDate}
                    license={license}
                />
            )}

            {!hasTrueUp && license.userCount - actualUserCount < 0 && (
                <Alert variant="warning">
                    <Trans
                        i18nKey="exceeded-licensed-users-warning"
                        components={{
                            '0': (
                                <Link
                                    to="https://sourcegraph.com/pricing"
                                    target="_blank"
                                    rel="noopener"
                                    onClick={() =>
                                        telemetryRecorder.recordEvent('admin.productSubscription.upgradeCTA', 'click', {
                                            metadata: { location: 1 },
                                        })
                                    }
                                />
                            ),
                        }}
                    />
                </Alert>
            )}
        </div>
    )
}

interface LicenseDetailsProps {
    license: ProductLicenseInfoResult['site']['productSubscription']['license']
}

const LicenseDetails: FC<LicenseDetailsProps> = ({ license }) => {
    const { t } = useTranslation('enterprise/site-admin/productSubscription')

    if (license.isValid) {
        return (
            <>
                {t('user-count-license', {
                    formatUserCountLicenseUserCountTrue: formatUserCount(license.userCount, true),
                })}
                <ExpirationDate
                    date={parseISO(license.expiresAt)}
                    showRelative={true}
                    lowercase={true}
                    showPrefix={true}
                />
            </>
        )
    }

    return (
        <Alert variant="danger">
            <Text className="mb-0">
                {t('invalid-license-key-reason')}
                {license.licenseInvalidityReason}
            </Text>
        </Alert>
    )
}
