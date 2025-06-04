import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { mdiCog, mdiAccount, mdiDelete, mdiPlus } from '@mdi/js'
import { useTranslation, Trans } from 'react-i18next'
import { Subject } from 'rxjs'

import { asError, isErrorLike, pluralize } from '@sourcegraph/common'
import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { Button, Link, Icon, H2, Text, Tooltip, ErrorAlert } from '@sourcegraph/wildcard'

import { FilteredConnection } from '../components/FilteredConnection'
import { PageTitle } from '../components/PageTitle'
import type { OrganizationFields } from '../graphql-operations'
import { orgURL } from '../org'

import { deleteOrganization, fetchAllOrganizations } from './backend'

interface OrgNodeProps {
    /**
     * The org to display in this list item.
     */
    node: OrganizationFields

    /**
     * Called when the org is updated by an action in this list item.
     */
    onDidUpdate?: () => void
}

const OrgNode: React.FunctionComponent<React.PropsWithChildren<OrgNodeProps>> = ({ node, onDidUpdate }) => {
    const { t } = useTranslation('site-admin')

    const [loading, setLoading] = useState<boolean | Error>(false)

    const deleteOrg = useCallback(() => {
        if (!window.confirm(`Delete the organization ${node.name}?`)) {
            return
        }

        setLoading(true)

        deleteOrganization(node.id).then(
            () => {
                setLoading(false)
                if (onDidUpdate) {
                    onDidUpdate()
                }
            },
            error => setLoading(asError(error))
        )
    }, [node.id, node.name, onDidUpdate])

    return (
        <li className="list-group-item py-2">
            <div className="d-flex align-items-center justify-content-between">
                <div>
                    <Link to={orgURL(node.name)}>
                        <strong>{node.name}</strong>
                    </Link>
                    <br />
                    <span className="text-muted">{node.displayName}</span>
                </div>
                <div>
                    <Tooltip content="Organization settings">
                        <Button to={`${orgURL(node.name)}/settings`} variant="secondary" size="sm" as={Link}>
                            <Icon aria-hidden={true} svgPath={mdiCog} />
                            {t('settings')}
                        </Button>
                    </Tooltip>{' '}
                    <Tooltip content="Organization members">
                        <Button to={`${orgURL(node.name)}/settings/members`} variant="secondary" size="sm" as={Link}>
                            <Icon aria-hidden={true} svgPath={mdiAccount} />{' '}
                            {node.members && (
                                <>
                                    {node.members.totalCount} {pluralize('member', node.members.totalCount)}
                                </>
                            )}
                        </Button>
                    </Tooltip>{' '}
                    <Tooltip content="Delete organization">
                        <Button
                            aria-label="Delete"
                            onClick={deleteOrg}
                            disabled={loading === true}
                            variant="danger"
                            size="sm"
                        >
                            <Icon aria-hidden={true} svgPath={mdiDelete} />
                        </Button>
                    </Tooltip>
                </div>
            </div>
            {isErrorLike(loading) && <ErrorAlert className="mt-2" error={loading.message} />}
        </li>
    )
}

interface Props extends TelemetryProps, TelemetryV2Props {}

/**
 * A page displaying the orgs on this site.
 */
export const SiteAdminOrgsPage: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    telemetryService,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('site-admin')

    const orgUpdates = useMemo(() => new Subject<void>(), [])
    const onDidUpdateOrg = useCallback((): void => orgUpdates.next(), [orgUpdates])

    useEffect(() => {
        telemetryService.logViewEvent('SiteAdminOrgs')
        telemetryRecorder.recordEvent('admin.orgs', 'view')
    }, [telemetryService, telemetryRecorder])

    return (
        <div className="site-admin-orgs-page">
            <PageTitle title={t('organizations-admin-title')} />
            <div className="d-flex justify-content-between align-items-center mb-3">
                <H2 className="mb-0">{t('organizations')}</H2>
                <Button to="/organizations/new" className="test-create-org-button" variant="primary" as={Link}>
                    <Icon aria-hidden={true} svgPath={mdiPlus} />
                    {t('create-organization')}
                </Button>
            </div>
            <Text>
                <Trans
                    i18nKey="organization-description"
                    components={{ '0': <Link to="/help/admin/organizations" /> }}
                />
            </Text>
            <FilteredConnection<OrganizationFields, Omit<OrgNodeProps, 'node'>>
                className="list-group list-group-flush mt-3"
                noun="organization"
                pluralNoun="organizations"
                queryConnection={fetchAllOrganizations}
                nodeComponent={OrgNode}
                nodeComponentProps={{
                    onDidUpdate: onDidUpdateOrg,
                }}
                updates={orgUpdates}
            />
        </div>
    )
}
