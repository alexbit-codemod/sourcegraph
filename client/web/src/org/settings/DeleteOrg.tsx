import React, { useCallback, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button, Container, H3, Text } from '@sourcegraph/wildcard'

import type { OrgAreaRouteContext } from '../area/OrgArea'

import { DeleteOrgModal } from './DeleteOrgModal'

interface DeleteOrgProps extends OrgAreaRouteContext {}

/**
 * Deletes an organization.
 */
export const DeleteOrg: React.FunctionComponent<React.PropsWithChildren<DeleteOrgProps>> = props => {
    const { t } = useTranslation('org/settings')

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const toggleDeleteModal = useCallback(
        () => setShowDeleteModal(!showDeleteModal),
        [setShowDeleteModal, showDeleteModal]
    )

    useEffect(() => props.telemetryRecorder.recordEvent('org.delete', 'view'), [props.telemetryRecorder])

    return (
        <Container className="mt-3 mb-5">
            <H3 className="text-danger">{t('delete-organization')}</H3>
            <div className="d-flex justify-content-between">
                <Text className="d-flex justify-content-right">{t('delete-organization-warning')}</Text>
                <Button variant="danger" size="sm" onClick={toggleDeleteModal}>
                    {t('confirm-delete-organization')}
                </Button>
                <DeleteOrgModal {...props} isOpen={showDeleteModal} toggleDeleteModal={toggleDeleteModal} />
            </div>
        </Container>
    )
}
