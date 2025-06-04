import React, { useCallback, useState } from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { logger } from '@sourcegraph/common'
import { Button, Modal, Input, H3, Text, Alert, Link, ErrorAlert, Form } from '@sourcegraph/wildcard'

import { LoaderButton } from '../../../components/LoaderButton'
import type { ExecutorSecretScope, Scalars } from '../../../graphql-operations'

import { useCreateExecutorSecret } from './backend'

export interface AddSecretModalProps {
    onCancel: () => void
    afterCreate: () => void
    namespaceID: Scalars['ID'] | null
    scope: ExecutorSecretScope

    /** For testing only */
    initialKey?: string
}

export const AddSecretModal: React.FunctionComponent<React.PropsWithChildren<AddSecretModalProps>> = ({
    onCancel,
    afterCreate,
    namespaceID,
    scope,
    initialKey = '',
}) => {
    const { t } = useTranslation('enterprise/executors/secrets')

    const labelId = 'addSecret'

    const [key, setKey] = useState<string>(initialKey)
    const onChangeKey = useCallback<React.ChangeEventHandler<HTMLInputElement>>(event => {
        setKey(event.target.value)
    }, [])

    const [value, setValue] = useState<string>('')
    const onChangeValue = useCallback<React.ChangeEventHandler<HTMLInputElement>>(event => {
        setValue(event.target.value)
    }, [])

    const [createExecutorSecret, { loading, error }] = useCreateExecutorSecret()

    const onSubmit = useCallback<React.FormEventHandler>(
        async event => {
            event.preventDefault()

            try {
                await createExecutorSecret({
                    variables: {
                        namespace: namespaceID,
                        key,
                        value,
                        scope,
                    },
                })

                afterCreate()
            } catch (error) {
                // Non-request error. API errors will be available under `error` above.
                logger.error(error)
            }
        },
        [createExecutorSecret, namespaceID, key, value, scope, afterCreate]
    )

    return (
        <Modal onDismiss={onCancel} aria-labelledby={labelId}>
            <H3 id={labelId}>{t('add-new-executor-secret')}</H3>
            <Text>{t('executor-secrets-description')}</Text>
            {error && <ErrorAlert error={error} />}
            <Form onSubmit={onSubmit}>
                <div className="form-group">
                    <Input
                        id="key"
                        name="key"
                        autoComplete="off"
                        inputClassName="mb-2"
                        className="mb-0"
                        required={true}
                        spellCheck="false"
                        minLength={1}
                        value={key}
                        onChange={onChangeKey}
                        pattern="^[A-Z][A-Z0-9_]*$"
                        message={
                            <>
                                <Trans
                                    i18nKey="executor-secret-requirements"
                                    components={{
                                        '0': (
                                            <Link
                                                to="/help/admin/executors/deploy_executors#using-private-registries"
                                                rel="noopener"
                                                target="_blank"
                                            />
                                        ),
                                    }}
                                />
                            </>
                        }
                        label={t('key-label')}
                    />
                    {key === 'DOCKER_AUTH_CONFIG' && (
                        <Alert variant="info" className="mt-2">
                            {t('docker-client-authentication-description')}
                        </Alert>
                    )}
                </div>
                <div className="form-group">
                    <Input
                        id="value"
                        name="value"
                        type="password"
                        autoComplete="off"
                        required={true}
                        spellCheck="false"
                        minLength={1}
                        label={t('value-label')}
                        value={value}
                        onChange={onChangeValue}
                    />
                </div>
                <div className="d-flex justify-content-end">
                    <Button disabled={loading} className="mr-2" onClick={onCancel} outline={true} variant="secondary">
                        {t('cancel-button')}
                    </Button>
                    <LoaderButton
                        type="submit"
                        disabled={loading || key.length === 0 || value.length === 0}
                        variant="primary"
                        loading={loading}
                        alwaysShowLabel={true}
                        label={t('add-secret-button')}
                    />
                </div>
            </Form>
        </Modal>
    )
}
