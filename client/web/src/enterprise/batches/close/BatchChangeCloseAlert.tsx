import React, { useCallback, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { isErrorLike, asError, pluralize } from '@sourcegraph/common'
import { Button, AlertLink, CardBody, Card, Alert, Checkbox, Text, ErrorAlert } from '@sourcegraph/wildcard'

import { LoaderButton } from '../../../components/LoaderButton'
import type { Scalars } from '../../../graphql-operations'

import { closeBatchChange as _closeBatchChange } from './backend'

export interface BatchChangeCloseAlertProps {
    batchChangeID: Scalars['ID']
    batchChangeURL: string
    closeChangesets: boolean
    viewerCanAdminister: boolean
    totalCount: number
    setCloseChangesets: (newValue: boolean) => void

    /** For testing only. */
    closeBatchChange?: typeof _closeBatchChange
}

export const BatchChangeCloseAlert: React.FunctionComponent<React.PropsWithChildren<BatchChangeCloseAlertProps>> = ({
    batchChangeID,
    batchChangeURL,
    closeChangesets,
    totalCount,
    setCloseChangesets,
    viewerCanAdminister,
    closeBatchChange = _closeBatchChange,
}) => {
    const { t } = useTranslation('enterprise/batches/close')

    const navigate = useNavigate()
    const onChangeCloseChangesets = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        event => {
            setCloseChangesets(event.target.checked)
        },
        [setCloseChangesets]
    )
    const onCancel = useCallback<React.MouseEventHandler>(() => {
        navigate(batchChangeURL)
    }, [navigate, batchChangeURL])
    const [isClosing, setIsClosing] = useState<boolean | Error>(false)
    const onClose = useCallback<React.MouseEventHandler>(async () => {
        setIsClosing(true)
        try {
            await closeBatchChange({ batchChange: batchChangeID, closeChangesets })
            navigate(batchChangeURL)
        } catch (error) {
            setIsClosing(asError(error))
        }
    }, [navigate, closeChangesets, closeBatchChange, batchChangeID, batchChangeURL])
    return (
        <>
            <Card className="mb-3">
                <CardBody>
                    <Text>
                        <strong>{t('batch-change-read-only-warning')}</strong>
                    </Text>
                    {totalCount > 0 && (
                        <>
                            <Text>{t('changesets-untouched-default')}</Text>
                            <Checkbox
                                wrapperClassName="mb-3"
                                id="closeChangesets"
                                checked={closeChangesets}
                                onChange={onChangeCloseChangesets}
                                className="test-batches-close-changesets-checkbox"
                                disabled={isClosing === true || !viewerCanAdminister}
                                label={
                                    <>
                                        {t('also-close')}
                                        {pluralize('the', totalCount, 'all')} {totalCount}{' '}
                                        {pluralize(
                                            'open changeset on the code host',
                                            totalCount,
                                            'open changesets on the code hosts'
                                        )}
                                        .
                                    </>
                                }
                            />
                        </>
                    )}
                    {!viewerCanAdminister && (
                        <Alert variant="warning">
                            {t('permission-denied-close-batch-change')}
                            <AlertLink to="/help/batch_changes/explanations/permissions_in_batch_changes">
                                {t('permissions-in-batch-changes')}
                            </AlertLink>
                            {t('batch-changes-permission-info')}
                        </Alert>
                    )}
                    <div className="d-flex justify-content-end">
                        <Button
                            className="mr-2 test-batches-close-abort-btn"
                            onClick={onCancel}
                            disabled={isClosing === true || !viewerCanAdminister}
                            variant="secondary"
                        >
                            {t('cancel-button')}
                        </Button>
                        <LoaderButton
                            className="test-batches-confirm-close-btn"
                            onClick={onClose}
                            disabled={isClosing === true || !viewerCanAdminister}
                            variant="danger"
                            loading={isClosing === true}
                            label={t('close-batch-change-label')}
                            alwaysShowLabel={true}
                        />
                    </div>
                </CardBody>
            </Card>
            {isErrorLike(isClosing) && <ErrorAlert error={isClosing} />}
        </>
    )
}
