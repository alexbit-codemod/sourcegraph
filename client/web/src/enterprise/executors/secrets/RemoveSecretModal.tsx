import React, { useCallback } from 'react'

import { useTranslation } from 'react-i18next'

import { logger } from '@sourcegraph/common'
import { Button, H3, Modal, ErrorAlert } from '@sourcegraph/wildcard'

import { LoaderButton } from '../../../components/LoaderButton'
import type { ExecutorSecretFields } from '../../../graphql-operations'

import { useDeleteExecutorSecret } from './backend'

export interface RemoveSecretModalProps {
    secret: ExecutorSecretFields

    onCancel: () => void
    afterDelete: () => void
}

export const RemoveSecretModal: React.FunctionComponent<React.PropsWithChildren<RemoveSecretModalProps>> = ({
    secret,
    onCancel,
    afterDelete,
}) => {
    const { t } = useTranslation('enterprise/executors/secrets')

    const labelId = 'removeSecret'

    const [deleteExecutorSecret, { loading, error }] = useDeleteExecutorSecret()

    const onDelete = useCallback<React.MouseEventHandler>(
        async event => {
            event.preventDefault()

            try {
                await deleteExecutorSecret({ variables: { id: secret.id, scope: secret.scope } })

                afterDelete()
            } catch (error) {
                // Non-request error. API errors will be available under `error` above.
                logger.error(error)
            }
        },
        [afterDelete, secret.id, secret.scope, deleteExecutorSecret]
    )

    return (
        <Modal onDismiss={onCancel} aria-labelledby={labelId}>
            <H3 id={labelId}>
                {t('executor-secret-label')}
                {secret.key}
            </H3>

            <strong className="d-block text-danger my-3">{t('removing-secrets-irreversible-warning')}</strong>

            {error && <ErrorAlert error={error} />}

            <div className="d-flex justify-content-end pt-1">
                <Button disabled={loading} className="mr-2" onClick={onCancel} outline={true} variant="secondary">
                    {t('cancel-button-label')}
                </Button>
                <LoaderButton
                    disabled={loading}
                    onClick={onDelete}
                    variant="danger"
                    loading={loading}
                    alwaysShowLabel={true}
                    label={t('remove-secret-button-label')}
                />
            </div>
        </Modal>
    )
}
