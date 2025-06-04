import React, { useCallback, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { asError, isErrorLike } from '@sourcegraph/common'
import { Button, Checkbox, Modal, H3, Text, ErrorAlert, Form } from '@sourcegraph/wildcard'

import { LoaderButton } from '../../../../components/LoaderButton'
import type { Scalars } from '../../../../graphql-operations'
import { mergeChangesets as _mergeChangesets } from '../backend'

export interface MergeChangesetsModalProps {
    onCancel: () => void
    afterCreate: () => void
    batchChangeID: Scalars['ID']
    changesetIDs: Scalars['ID'][]

    /** For testing only. */
    mergeChangesets?: typeof _mergeChangesets
}

export const MergeChangesetsModal: React.FunctionComponent<React.PropsWithChildren<MergeChangesetsModalProps>> = ({
    onCancel,
    afterCreate,
    batchChangeID,
    changesetIDs,
    mergeChangesets = _mergeChangesets,
}) => {
    const { t } = useTranslation('enterprise/batches/detail/changesets')

    const [isLoading, setIsLoading] = useState<boolean | Error>(false)
    const [squash, setSquash] = useState<boolean>(false)

    const onSubmit = useCallback<React.FormEventHandler>(async () => {
        setIsLoading(true)
        try {
            await mergeChangesets(batchChangeID, changesetIDs, squash)
            afterCreate()
        } catch (error) {
            setIsLoading(asError(error))
        }
    }, [changesetIDs, mergeChangesets, batchChangeID, squash, afterCreate])

    const onToggleSquash = useCallback<React.ChangeEventHandler<HTMLInputElement>>(event => {
        setSquash(event.target.checked)
    }, [])

    return (
        <Modal onDismiss={onCancel} aria-labelledby={MODAL_LABEL_ID}>
            <H3 id={MODAL_LABEL_ID}>{t('merge-changesets')}</H3>
            <Text className="mb-4">{t('confirm-merge-all-selected-changesets')}</Text>
            <Form>
                <div className="form-group">
                    <Checkbox
                        id={CHECKBOX_ID}
                        checked={squash}
                        onChange={onToggleSquash}
                        disabled={isLoading === true}
                        label={t('squash-merge-selected-changesets')}
                    />
                </div>
            </Form>
            {isErrorLike(isLoading) && <ErrorAlert error={isLoading} />}
            <div className="d-flex justify-content-end">
                <Button
                    disabled={isLoading === true}
                    className="mr-2"
                    onClick={onCancel}
                    outline={true}
                    variant="secondary"
                >
                    {t('cancel-action')}
                </Button>
                <LoaderButton
                    onClick={onSubmit}
                    disabled={isLoading === true}
                    variant="primary"
                    loading={isLoading === true}
                    alwaysShowLabel={true}
                    label={t('merge-action')}
                />
            </div>
        </Modal>
    )
}

const MODAL_LABEL_ID = 'merge-changesets-modal-title'
const CHECKBOX_ID = 'merge-changesets-modal-squash-check'
