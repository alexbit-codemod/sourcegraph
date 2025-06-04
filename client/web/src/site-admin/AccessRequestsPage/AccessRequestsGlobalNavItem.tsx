import type { FC } from 'react'

import { mdiAccountPlus } from '@mdi/js'
import { useTranslation, Trans } from 'react-i18next'

import { pluralize } from '@sourcegraph/common'
import { useQuery } from '@sourcegraph/http-client'
import { ButtonLink, Text, Icon } from '@sourcegraph/wildcard'

import type { AccessRequestsCountResult, AccessRequestsCountVariables } from '../../graphql-operations'
import { checkRequestAccessAllowed } from '../../util/checkRequestAccessAllowed'

import { ACCESS_REQUESTS_COUNT } from './queries'

interface AccessRequestsGlobalNavItemProps {
    className?: string
}

/**
 * A link to the access requests page that the number of pending requests.
 * Does not render anything if request access is not allowed or there are no pending requests.
 */
export const AccessRequestsGlobalNavItem: FC<AccessRequestsGlobalNavItemProps> = props => {
    const { t } = useTranslation('site-admin/AccessRequestsPage')

    const { className } = props
    const isRequestAccessAllowed = checkRequestAccessAllowed(window.context)

    const { data } = useQuery<AccessRequestsCountResult, AccessRequestsCountVariables>(ACCESS_REQUESTS_COUNT, {
        fetchPolicy: 'network-only',
        skip: !isRequestAccessAllowed,
    })

    if (!data?.accessRequests.totalCount) {
        return null
    }

    return (
        <ButtonLink variant="success" size="sm" to="/site-admin/account-requests" className={className}>
            <Icon svgPath={mdiAccountPlus} size="md" aria-label="Account requests icons" color="var(--success-2)" />
            <Trans
                i18nKey="account-access-requests-total-count"
                values={{ dataAccessRequestsTotalCount: <>{data?.accessRequests.totalCount}</> }}
                components={{ '0': <Text className="mx-1" weight="bold" as="span" /> }}
            />
            {pluralize('request', data?.accessRequests.totalCount)}
        </ButtonLink>
    )
}
