import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'

import { mdiPlus } from '@mdi/js'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { Timestamp } from '@sourcegraph/branded/src/components/Timestamp'
import { logger } from '@sourcegraph/common'
import { useMutation, useQuery } from '@sourcegraph/http-client'
import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { Button, LoadingSpinner, Link, Icon, ErrorAlert, PageHeader, Container, H3, Text } from '@sourcegraph/wildcard'

import {
    ConnectionContainer,
    ConnectionError,
    ConnectionList,
    ConnectionLoading,
    ConnectionSummary,
    ShowMoreButton,
    SummaryContainer,
} from '../../../../components/FilteredConnection/ui'
import { PageTitle } from '../../../../components/PageTitle'
import { useScrollToLocationHash } from '../../../../components/useScrollToLocationHash'
import type {
    DotComProductSubscriptionResult,
    DotComProductSubscriptionVariables,
    ArchiveProductSubscriptionResult,
    ArchiveProductSubscriptionVariables,
} from '../../../../graphql-operations'
import { AccountName } from '../../../dotcom/productSubscriptions/AccountName'
import { ProductSubscriptionLabel } from '../../../dotcom/productSubscriptions/ProductSubscriptionLabel'
import { LicenseGenerationKeyWarning } from '../../../productSubscription/LicenseGenerationKeyWarning'

import {
    ARCHIVE_PRODUCT_SUBSCRIPTION,
    DOTCOM_PRODUCT_SUBSCRIPTION,
    useProductSubscriptionLicensesConnection,
} from './backend'
import { CodyServicesSection } from './CodyServicesSection'
import type { EnterprisePortalEnvironment } from './enterpriseportal'
import { SiteAdminGenerateProductLicenseForSubscriptionForm } from './SiteAdminGenerateProductLicenseForSubscriptionForm'
import { SiteAdminProductLicenseNode } from './SiteAdminProductLicenseNode'
import { accessTokenPath, errorForPath, enterprisePortalID } from './utils'

interface Props extends TelemetryV2Props {}

/**
 * Displays a product subscription in the site admin area.
 */
export const SiteAdminProductSubscriptionPage: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    telemetryRecorder,
}) => {
    const { t } = useTranslation('enterprise/site-admin/dotcom/productSubscriptions')

    const navigate = useNavigate()
    const { subscriptionUUID = '' } = useParams<{ subscriptionUUID: string }>()
    useEffect(() => telemetryRecorder.recordEvent('admin.productSubscription', 'view'), [telemetryRecorder])

    const [showGenerate, setShowGenerate] = useState<boolean>(false)

    const { data, loading, error, refetch } = useQuery<
        DotComProductSubscriptionResult,
        DotComProductSubscriptionVariables
    >(DOTCOM_PRODUCT_SUBSCRIPTION, {
        variables: { uuid: subscriptionUUID },
        errorPolicy: 'all',
    })

    const [archiveProductSubscription, { loading: archiveLoading, error: archiveError }] = useMutation<
        ArchiveProductSubscriptionResult,
        ArchiveProductSubscriptionVariables
    >(ARCHIVE_PRODUCT_SUBSCRIPTION)

    const onArchive = useCallback(async () => {
        if (!data) {
            return
        }
        if (
            !window.confirm(
                'Do you really want to archive this product subscription? This will hide it from site admins and users.\n\nHowever, it does NOT:\n\n- invalidate the license key\n- refund payment or cancel billing\n\nYou must manually do those things.'
            )
        ) {
            return
        }
        try {
            telemetryRecorder.recordEvent('admin.productSubscription', 'archive')
            await archiveProductSubscription({ variables: { id: data.dotcom.productSubscription.id } })
            navigate('/site-admin/dotcom/product/subscriptions')
        } catch (error) {
            logger.error(error)
        }
    }, [data, archiveProductSubscription, navigate, telemetryRecorder])

    const toggleShowGenerate = useCallback((): void => setShowGenerate(previousValue => !previousValue), [])

    const refetchRef = useRef<(() => void) | null>(null)
    const setRefetchRef = useCallback(
        (refetch: (() => void) | null) => {
            refetchRef.current = refetch
        },
        [refetchRef]
    )

    const onLicenseUpdate = useCallback(async () => {
        await refetch()
        if (refetchRef.current) {
            refetchRef.current()
        }
        setShowGenerate(false)
    }, [refetch, refetchRef])

    if (loading && !data) {
        return <LoadingSpinner />
    }

    // If there's an error, and the entire request failed loading, simply render an error page.
    // Otherwise, we want to get more specific with error handling.
    if (
        error &&
        (error.networkError ||
            error.clientErrors.length > 0 ||
            !(error.graphQLErrors.length === 1 && errorForPath(error, accessTokenPath)))
    ) {
        return <ErrorAlert className="my-2" error={error} />
    }

    const productSubscription = data!.dotcom.productSubscription

    /**
     * TODO(@robert): As part of https://linear.app/sourcegraph/issue/CORE-100,
     * eventually dev subscriptions will only live on Enterprise Portal dev and
     * prod subscriptions will only live on Enterprise Portal prod. Until we
     * cut over, we use license tags to determine what Enterprise Portal
     * environment to target.
     */
    const enterprisePortalEnvironment: EnterprisePortalEnvironment =
        window.context.deployType === 'dev'
            ? 'local'
            : productSubscription.activeLicense?.info?.tags?.includes('dev')
            ? 'dev'
            : 'prod'

    return (
        <>
            <div className="site-admin-product-subscription-page">
                <PageTitle title={t('enterprise-subscription')} />
                <PageHeader
                    headingElement="h2"
                    path={[
                        { text: 'Enterprise subscriptions', to: '/site-admin/dotcom/product/subscriptions' },
                        { text: enterprisePortalID(subscriptionUUID) },
                    ]}
                    description={
                        <span className="text-muted">
                            {t('created-label')}
                            <Timestamp date={productSubscription.createdAt} />
                        </span>
                    }
                    actions={
                        <Button onClick={onArchive} disabled={archiveLoading} variant="danger">
                            {t('archive-label')}
                        </Button>
                    }
                    className="mb-3"
                />
                {archiveError && <ErrorAlert className="mt-2" error={archiveError} />}

                <H3>{t('details-label')}</H3>
                <Container className="mb-3">
                    <table className="table mb-0">
                        <tbody>
                            <tr>
                                <th className="text-nowrap">{t('id-label')}</th>
                                <td className="w-100">{enterprisePortalID(subscriptionUUID)}</td>
                            </tr>
                            <tr>
                                <th className="text-nowrap">{t('current-plan-label')}</th>
                                <td className="w-100">
                                    <ProductSubscriptionLabel productSubscription={productSubscription} />
                                </td>
                            </tr>
                            <tr>
                                <th className="text-nowrap">{t('account-label')}</th>
                                <td className="w-100">
                                    <AccountName account={productSubscription.account} /> &mdash;{' '}
                                    <Link to={productSubscription.url}>{t('view-as-user-label')}</Link>
                                </td>
                            </tr>
                            <tr>
                                <th className="text-nowrap">{t('salesforce-opportunity-label')}</th>
                                <td className="w-100">
                                    {(!productSubscription.activeLicense ||
                                        productSubscription.activeLicense.info?.salesforceOpportunityID === null) && (
                                        <span className="text-muted">{t('none-label')}</span>
                                    )}
                                    {productSubscription.activeLicense &&
                                        productSubscription.activeLicense.info?.salesforceOpportunityID !== null && (
                                            <>{productSubscription.activeLicense.info?.salesforceOpportunityID}</>
                                        )}
                                </td>
                            </tr>
                            <tr>
                                <th className="text-nowrap">{t('salesforce-subscription-label')}</th>
                                <td className="w-100">
                                    {(!productSubscription.activeLicense ||
                                        productSubscription.activeLicense.info?.salesforceSubscriptionID === null) && (
                                        <span className="text-muted">{t('none-label-duplicate')}</span>
                                    )}
                                    {productSubscription.activeLicense &&
                                        productSubscription.activeLicense.info?.salesforceSubscriptionID !== null && (
                                            <>{productSubscription.activeLicense.info?.salesforceSubscriptionID}</>
                                        )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Container>

                <CodyServicesSection
                    enterprisePortalEnvironment={enterprisePortalEnvironment}
                    viewerCanAdminister={true}
                    currentSourcegraphAccessToken={productSubscription.currentSourcegraphAccessToken}
                    accessTokenError={errorForPath(error, accessTokenPath)}
                    codyGatewayAccess={productSubscription.codyGatewayAccess}
                    productSubscriptionID={productSubscription.id}
                    productSubscriptionUUID={subscriptionUUID}
                    refetchSubscription={refetch}
                    telemetryRecorder={telemetryRecorder}
                />

                <H3 className="d-flex align-items-start">
                    {t('licenses-label')}
                    <Button className="ml-auto" onClick={toggleShowGenerate} variant="primary">
                        <Icon aria-hidden={true} svgPath={mdiPlus} />
                        {t('new-license-key-label')}
                    </Button>
                </H3>
                <LicenseGenerationKeyWarning className="mb-2" />
                <Container className="mb-2">
                    <ProductSubscriptionLicensesConnection
                        subscriptionUUID={subscriptionUUID}
                        toggleShowGenerate={toggleShowGenerate}
                        setRefetch={setRefetchRef}
                        telemetryRecorder={telemetryRecorder}
                    />
                </Container>
            </div>

            {showGenerate && (
                <SiteAdminGenerateProductLicenseForSubscriptionForm
                    subscriptionID={productSubscription.id}
                    subscriptionAccount={productSubscription.account?.username || ''}
                    latestLicense={productSubscription.productLicenses?.nodes[0] ?? undefined}
                    onGenerate={onLicenseUpdate}
                    onCancel={() => setShowGenerate(false)}
                    telemetryRecorder={telemetryRecorder}
                />
            )}
        </>
    )
}

interface ProductSubscriptionLicensesConnectionProps extends TelemetryV2Props {
    subscriptionUUID: string
    toggleShowGenerate: () => void
    setRefetch: (refetch: () => void) => void
}

const ProductSubscriptionLicensesConnection: React.FunctionComponent<ProductSubscriptionLicensesConnectionProps> = ({
    subscriptionUUID,
    setRefetch,
    toggleShowGenerate,
    telemetryRecorder,
}) => {
    const { loading, hasNextPage, fetchMore, refetchAll, connection, error } = useProductSubscriptionLicensesConnection(
        subscriptionUUID,
        20
    )

    useEffect(() => {
        setRefetch(refetchAll)
    }, [setRefetch, refetchAll])

    const location = useLocation()
    const licenseIDFromLocationHash = useMemo(() => {
        if (location.hash.length > 1) {
            return decodeURIComponent(location.hash.slice(1))
        }
        return
    }, [location.hash])
    useScrollToLocationHash(location)

    return (
        <ConnectionContainer>
            {error && <ConnectionError errors={[error.message]} />}
            {loading && !connection && <ConnectionLoading />}
            <ConnectionList as="ul" className="list-group list-group-flush mb-0" aria-label="Subscription licenses">
                {connection?.nodes?.map(node => (
                    <SiteAdminProductLicenseNode
                        key={node.id}
                        node={node}
                        defaultExpanded={node.id === licenseIDFromLocationHash}
                        showSubscription={false}
                        onRevokeCompleted={refetchAll}
                        telemetryRecorder={telemetryRecorder}
                    />
                ))}
            </ConnectionList>
            {connection && (
                <SummaryContainer centered={true}>
                    <ConnectionSummary
                        first={15}
                        centered={true}
                        connection={connection}
                        noun="product license"
                        pluralNoun="product licenses"
                        hasNextPage={hasNextPage}
                        emptyElement={<NoProductLicense toggleShowGenerate={toggleShowGenerate} />}
                    />
                    {hasNextPage && <ShowMoreButton centered={true} onClick={fetchMore} />}
                </SummaryContainer>
            )}
        </ConnectionContainer>
    )
}

const NoProductLicense: React.FunctionComponent<{
    toggleShowGenerate: () => void
}> = ({ toggleShowGenerate }) => {
    const { t } = useTranslation('enterprise/site-admin/dotcom/productSubscriptions')

    return (
        <>
            <Text className="text-muted">{t('no-license-key-message')}</Text>
            <Button onClick={toggleShowGenerate} variant="primary">
                <Icon aria-hidden={true} svgPath={mdiPlus} />
                {t('new-license-key-label-duplicate')}
            </Button>
        </>
    )
}
