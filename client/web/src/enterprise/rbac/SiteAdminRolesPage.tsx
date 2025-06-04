import React, { useEffect, useState, useCallback } from 'react'

import { mdiPlus } from '@mdi/js'
import { groupBy, noop } from 'lodash'
import { useTranslation, Trans } from 'react-i18next'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { PageHeader, Button, Icon, ProductStatusBadge, ErrorAlert, LoadingSpinner, Link } from '@sourcegraph/wildcard'

import { PageTitle } from '../../components/PageTitle'

import { useRolesConnection, usePermissions, type PermissionsMap } from './backend'
import { CreateRoleModal } from './components/CreateRoleModal'
import { RoleNode } from './components/RoleNode'

import styles from './SiteAdminRolesPage.module.scss'

export interface SiteAdminRolesPageProps extends TelemetryV2Props {}

export const SiteAdminRolesPage: React.FunctionComponent<React.PropsWithChildren<SiteAdminRolesPageProps>> = ({
    telemetryRecorder,
}) => {
    const { t } = useTranslation('enterprise/rbac')

    useEffect(() => {
        telemetryRecorder.recordEvent('admin.roles', 'view')
    }, [telemetryRecorder])

    const [permissions, setPermissions] = useState<PermissionsMap>({} as PermissionsMap)

    // TODO: Fetch paginated roles.
    const { data, error: rolesError, loading: rolesLoading, refetch } = useRolesConnection()
    // We need to query all permissions from the database, so site admins can update easily if they want to.
    const { error: permissionsError, loading: permissionsLoading } = usePermissions(result =>
        setPermissions(groupBy(result.permissions.nodes, 'namespace') as PermissionsMap)
    )

    const [showCreateRoleModal, setShowCreateRoleModal] = useState<boolean>(false)
    const openModal = useCallback<React.MouseEventHandler>(event => {
        event.preventDefault()
        setShowCreateRoleModal(true)
    }, [])
    const closeModal = useCallback(() => {
        setShowCreateRoleModal(false)
    }, [])

    const afterCreate = useCallback(() => {
        closeModal()
        // We handle any error by destructuring the query result directly
        refetch().catch(noop)
    }, [closeModal, refetch])

    const loading = rolesLoading || permissionsLoading
    const error = rolesError || permissionsError

    return (
        <div className="site-admin-roles-page">
            <PageTitle title={t('roles-admin')} />
            <PageHeader
                className={styles.rolesPageHeader}
                description={
                    <>
                        <Trans
                            i18nKey="roles-description-access-control"
                            components={{
                                '0': <Link to="/help/admin/access_control" />,
                                '1': <Link to="/site-admin/users" />,
                            }}
                        />
                    </>
                }
                actions={
                    <Button variant="primary" onClick={openModal}>
                        <Icon aria-hidden={true} svgPath={mdiPlus} />
                        {t('create-role')}
                    </Button>
                }
            >
                <PageHeader.Heading as="h2">
                    <PageHeader.Breadcrumb>
                        {t('roles-label')}
                        <ProductStatusBadge status="beta" />
                    </PageHeader.Breadcrumb>
                </PageHeader.Heading>
            </PageHeader>

            {showCreateRoleModal && !loading && (
                <CreateRoleModal
                    onCancel={closeModal}
                    afterCreate={afterCreate}
                    allPermissions={permissions}
                    telemetryRecorder={telemetryRecorder}
                />
            )}

            {error && <ErrorAlert error={error} />}
            {loading && <LoadingSpinner />}
            {!loading && data && (
                <ul className="list-unstyled">
                    {data.roles.nodes.map(node => (
                        <RoleNode
                            key={node.id}
                            node={node}
                            refetch={refetch}
                            allPermissions={permissions}
                            telemetryRecorder={telemetryRecorder}
                        />
                    ))}
                </ul>
            )}
        </div>
    )
}
