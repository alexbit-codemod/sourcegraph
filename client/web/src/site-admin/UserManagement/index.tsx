import React, { useEffect, useMemo } from 'react'

import { mdiAccount, mdiPlus, mdiDownload } from '@mdi/js'
import { useTranslation } from 'react-i18next'

import { useQuery } from '@sourcegraph/http-client'
import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { EVENT_LOGGER } from '@sourcegraph/shared/src/telemetry/web/eventLogger'
import { H1, Card, Text, Icon, Button, Link, Alert, LoadingSpinner, AnchorLink } from '@sourcegraph/wildcard'

import type { UsersManagementSummaryResult, UsersManagementSummaryVariables } from '../../graphql-operations'
import { checkRequestAccessAllowed } from '../../util/checkRequestAccessAllowed'
import { ValueLegendList, type ValueLegendListProps } from '../analytics/components/ValueLegendList'

import { type SiteUser, UsersList } from './components/UsersList'
import { USERS_MANAGEMENT_SUMMARY } from './queries'

import styles from './index.module.scss'

export interface UsersManagementProps extends TelemetryV2Props {
    renderAssignmentModal: (
        onCancel: () => void,
        onSuccess: (user: { username: string }) => void,
        user: SiteUser
    ) => React.ReactNode
}

export const UsersManagement: React.FunctionComponent<UsersManagementProps> = ({
    renderAssignmentModal,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('site-admin/UserManagement')

    useEffect(() => {
        EVENT_LOGGER.logPageView('UsersManagement')
        telemetryRecorder.recordEvent('admin.users', 'view')
    }, [telemetryRecorder])

    const { data, error, loading, refetch } = useQuery<UsersManagementSummaryResult, UsersManagementSummaryVariables>(
        USERS_MANAGEMENT_SUMMARY,
        {
            variables: {},
        }
    )

    const legends = useMemo(() => {
        if (!data) {
            return []
        }

        const legends: ValueLegendListProps['items'] = [
            {
                value: data.site.registeredUsers.totalCount,
                description: 'Registered Users',
                color: 'var(--purple)',
                position: 'left',
                tooltip: 'Total number of registered and not deleted users.',
            },
            {
                value: data.site.productSubscription.license?.userCount ?? 0,
                description: 'User licenses',
                color: 'var(--body-color)',
                position: 'right',
                tooltip: 'The number of user licenses your current account is provisioned for.',
            },
            {
                value: data.site.adminUsers?.totalCount ?? 0,
                description: 'Administrators',
                color: 'var(--body-color)',
                position: 'right',
                tooltip: 'The number of users with site admin permissions.',
            },
        ]

        const isRequestAccessAllowed = checkRequestAccessAllowed(window.context)

        if (isRequestAccessAllowed) {
            legends.push({
                value: data.pendingAccessRequests.totalCount,
                description: 'Pending requests',
                color: 'var(--cyan)',
                position: 'left',
                tooltip: 'The number of users who have requested access to your Sourcegraph instance.',
            })
        }

        return legends
    }, [data])

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
                <H1 className="d-flex align-items-center mb-0">
                    <Icon
                        svgPath={mdiAccount}
                        aria-label="user administration avatar icon"
                        size="md"
                        className={styles.linkColor}
                    />
                    {t('user-administration')}
                </H1>
                <div>
                    <Button
                        to="/site-admin/usage-statistics/archive"
                        download="true"
                        className="mr-4"
                        variant="secondary"
                        outline={true}
                        as={AnchorLink}
                    >
                        <Icon svgPath={mdiDownload} aria-label="Download usage stats" className="mr-1" />
                        {t('download-usage-stats')}
                    </Button>
                    <Button to="/site-admin/users/new" variant="primary" as={Link}>
                        <Icon svgPath={mdiPlus} aria-label="create user" className="mr-1" />
                        {t('create-user')}
                    </Button>
                </div>
            </div>
            <Card className="p-3">
                {error ? (
                    <Alert variant="danger">{error.message}</Alert>
                ) : loading || !legends.length ? (
                    <LoadingSpinner />
                ) : (
                    <ValueLegendList className="mb-3" items={legends} />
                )}
                <UsersList onActionEnd={refetch} renderAssignmentModal={renderAssignmentModal} />
            </Card>
            <Text className="font-italic text-center mt-2">{t('event-logs-update-info')}</Text>
        </>
    )
}
