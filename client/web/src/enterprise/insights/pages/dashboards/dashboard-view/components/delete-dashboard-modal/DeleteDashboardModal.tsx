import React from 'react'

import { mdiClose } from '@mdi/js'
import { VisuallyHidden } from '@reach/visually-hidden'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { isErrorLike } from '@sourcegraph/common'
import { Button, Modal, H2, Icon, ErrorAlert } from '@sourcegraph/wildcard'

import { LoaderButton } from '../../../../../../../components/LoaderButton'
import type { CustomInsightDashboard } from '../../../../../core/types'

import { useDeleteDashboardHandler } from './hooks/use-delete-dashboard-handler'

import styles from './DeleteDashobardModal.module.scss'

export interface DeleteDashboardModalProps {
    dashboard: CustomInsightDashboard
    onClose: () => void
}

export const DeleteDashboardModal: React.FunctionComponent<
    React.PropsWithChildren<DeleteDashboardModalProps>
> = props => {
    const { t } = useTranslation(
        'enterprise/insights/pages/dashboards/dashboard-view/components/delete-dashboard-modal'
    )

    const { dashboard, onClose } = props
    const navigate = useNavigate()

    const handleDeleteSuccess = (): void => {
        navigate('/insights/dashboards')
        onClose()
    }

    const { loadingOrError, handler } = useDeleteDashboardHandler({
        dashboard,
        onSuccess: handleDeleteSuccess,
    })

    const isDeleting = !isErrorLike(loadingOrError) && loadingOrError

    return (
        <Modal className={styles.modal} onDismiss={onClose} aria-label="Delete code insight dashboard modal">
            <Button variant="icon" className={styles.closeButton} onClick={onClose}>
                <VisuallyHidden>{t('close-button')}</VisuallyHidden>
                <Icon svgPath={mdiClose} inline={false} aria-hidden={true} />
            </Button>

            <H2 className="text-danger">
                {t('delete-confirmation')}
                {dashboard.title}”
            </H2>

            <span className="d-block mb-4">{t('delete-warning-message')}</span>

            {isErrorLike(loadingOrError) && <ErrorAlert className='className="mt-3"' error={loadingOrError} />}

            <div className="d-flex justify-content-end mt-4">
                <Button type="button" className="mr-2" variant="secondary" onClick={onClose}>
                    {t('cancel-button')}
                </Button>

                <LoaderButton
                    alwaysShowLabel={true}
                    loading={isDeleting}
                    label={isDeleting ? 'Deleting' : 'Delete forever'}
                    disabled={isDeleting}
                    onClick={handler}
                    variant="danger"
                />
            </div>
        </Modal>
    )
}
