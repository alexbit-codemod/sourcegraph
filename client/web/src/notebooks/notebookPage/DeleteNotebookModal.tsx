import React, { type FC, useCallback, useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { Observable } from 'rxjs'
import { mergeMap, startWith, tap, catchError } from 'rxjs/operators'

import { asError, isErrorLike } from '@sourcegraph/common'
import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { LoadingSpinner, useEventObservable, Modal, Button, Alert, H3, Text } from '@sourcegraph/wildcard'

import type { deleteNotebook as _deleteNotebook } from '../backend'

interface DeleteNotebookModalProps extends TelemetryProps, TelemetryV2Props {
    notebookId: string
    isOpen: boolean
    toggleDeleteModal: () => void
    deleteNotebook: typeof _deleteNotebook
}

const LOADING = 'loading' as const
const deleteLabelId = 'deleteNotebookId'

export const DeleteNotebookModal: FC<DeleteNotebookModalProps> = ({
    notebookId,
    deleteNotebook,
    isOpen,
    toggleDeleteModal,
    telemetryService,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('notebooks/notebookPage')

    const navigate = useNavigate()

    useEffect(() => {
        if (isOpen) {
            telemetryService.log('SearchNotebookDeleteModalOpened')
            telemetryRecorder.recordEvent('notebook.deleteModal', 'open')
        }
    }, [isOpen, telemetryService, telemetryRecorder])

    const [onDelete, deleteCompletedOrError] = useEventObservable(
        useCallback(
            (click: Observable<React.MouseEvent<HTMLButtonElement>>) =>
                click.pipe(
                    tap(() => {
                        telemetryService.log('SearchNotebookDeleteButtonClicked')
                        telemetryRecorder.recordEvent('notebook', 'delete')
                    }),
                    mergeMap(() =>
                        deleteNotebook(notebookId).pipe(
                            tap(() => {
                                navigate('/notebooks')
                            }),
                            startWith(LOADING),
                            catchError(error => [asError(error)])
                        )
                    )
                ),
            [deleteNotebook, navigate, notebookId, telemetryService, telemetryRecorder]
        )
    )

    return (
        <Modal isOpen={isOpen} position="center" onDismiss={toggleDeleteModal} aria-labelledby={deleteLabelId}>
            <H3 className="text-danger" id={deleteLabelId}>
                {t('delete-notebook-confirmation')}
            </H3>

            <Text>
                <strong>{t('action-irreversible-warning')}</strong>
            </Text>
            {(!deleteCompletedOrError || isErrorLike(deleteCompletedOrError)) && (
                <div className="text-right">
                    <Button className="mr-2" onClick={toggleDeleteModal} variant="secondary" outline={true}>
                        {t('cancel-button')}
                    </Button>
                    <Button onClick={onDelete} variant="danger">
                        {t('confirm-delete-notebook')}
                    </Button>
                    {isErrorLike(deleteCompletedOrError) && (
                        <Alert className="mt-2" variant="danger">
                            {t('error-deleting-notebook')}
                            {deleteCompletedOrError.message}
                        </Alert>
                    )}
                </div>
            )}
            {deleteCompletedOrError && <div>{deleteCompletedOrError === 'loading' && <LoadingSpinner />}</div>}
        </Modal>
    )
}
