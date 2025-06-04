import React, { useCallback, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { logger } from '@sourcegraph/common'
import { useMutation } from '@sourcegraph/http-client'
import { Button, Modal, Input, H3, Text, ErrorAlert, Form } from '@sourcegraph/wildcard'

import { LoaderButton } from '../../../../components/LoaderButton'
import type {
    CodyGatewayRateLimitFields,
    Scalars,
    UpdateCodyGatewayConfigResult,
    UpdateCodyGatewayConfigVariables,
} from '../../../../graphql-operations'

import { UPDATE_CODY_GATEWAY_CONFIG } from './backend'
import { numberFormatter, prettyInterval } from './utils'

export interface CodyGatewayRateLimitModalProps {
    onCancel: () => void
    afterSave: () => void
    productSubscriptionID: Scalars['ID']
    current: CodyGatewayRateLimitFields | null
    mode: 'chat' | 'code' | 'embeddings'
}

export const CodyGatewayRateLimitModal: React.FunctionComponent<
    React.PropsWithChildren<CodyGatewayRateLimitModalProps>
> = ({ onCancel, afterSave, productSubscriptionID, current, mode }) => {
    const { t } = useTranslation('enterprise/site-admin/dotcom/productSubscriptions')

    const labelId = 'codyGatewayRateLimit'

    const [limit, setLimit] = useState<number>(Number(current?.limit) ?? 100)
    const onChangeLimit = useCallback<React.ChangeEventHandler<HTMLInputElement>>(event => {
        setLimit(parseInt(event.target.value, 10))
    }, [])

    const [limitInterval, setLimitInterval] = useState<number>(current?.intervalSeconds ?? 60 * 60)
    const onChangeLimitInterval = useCallback<React.ChangeEventHandler<HTMLInputElement>>(event => {
        setLimitInterval(parseInt(event.target.value, 10))
    }, [])

    const [updateCodyGatewayConfig, { loading, error }] = useMutation<
        UpdateCodyGatewayConfigResult,
        UpdateCodyGatewayConfigVariables
    >(UPDATE_CODY_GATEWAY_CONFIG)

    const onSubmit = useCallback<React.FormEventHandler>(
        async event => {
            event.preventDefault()

            try {
                await updateCodyGatewayConfig({
                    variables: {
                        productSubscriptionID,
                        access: {
                            ...(mode === 'chat'
                                ? {
                                      chatCompletionsRateLimit: String(limit),
                                      chatCompletionsRateLimitIntervalSeconds: limitInterval,
                                  }
                                : {}),

                            ...(mode === 'code'
                                ? {
                                      codeCompletionsRateLimit: String(limit),
                                      codeCompletionsRateLimitIntervalSeconds: limitInterval,
                                  }
                                : {}),

                            ...(mode === 'embeddings'
                                ? {
                                      embeddingsRateLimit: String(limit),
                                      embeddingsRateLimitIntervalSeconds: limitInterval,
                                  }
                                : {}),
                        },
                    },
                })

                afterSave()
            } catch (error) {
                // Non-request error. API errors will be available under `error` above.
                logger.error(error)
            }
        },
        [updateCodyGatewayConfig, productSubscriptionID, limit, limitInterval, afterSave, mode]
    )

    return (
        <Modal onDismiss={onCancel} aria-labelledby={labelId}>
            <H3 id={labelId}>
                {t('configure-rate-limit-for-cody-gateway', { modeCode: mode === 'code', modeChat: mode === 'chat' })}
            </H3>
            <Text>{t('cody-gateway-description')}</Text>

            {error && <ErrorAlert error={error} />}

            <Form onSubmit={onSubmit}>
                <div className="form-group">
                    <Input
                        id="limit"
                        name="limit"
                        autoComplete="off"
                        inputClassName="mb-2"
                        className="mb-0"
                        required={true}
                        disabled={loading}
                        spellCheck="false"
                        type="number"
                        min={1}
                        value={limit}
                        onChange={onChangeLimit}
                        label={mode === 'embeddings' ? 'Number of tokens embedded' : 'Number of requests'}
                    />
                </div>
                <div className="form-group">
                    <Input
                        id="limitInterval"
                        name="limitInterval"
                        type="number"
                        autoComplete="off"
                        spellCheck="false"
                        required={true}
                        disabled={loading}
                        min={1}
                        label={t('rate-limit-interval')}
                        description={t('interval-definition')}
                        value={limitInterval}
                        onChange={onChangeLimitInterval}
                        message={
                            <>
                                {numberFormatter.format(BigInt(limit))}
                                {t('tokens-or-requests-per', { modeEmbeddings: mode === 'embeddings' })}
                                {prettyInterval(limitInterval)}
                            </>
                        }
                    />
                </div>
                <div className="d-flex justify-content-end">
                    <Button disabled={loading} className="mr-2" onClick={onCancel} outline={true} variant="secondary">
                        {t('cancel-button')}
                    </Button>
                    <LoaderButton
                        type="submit"
                        disabled={loading || limit <= 0 || limitInterval <= 0}
                        variant="primary"
                        loading={loading}
                        alwaysShowLabel={true}
                        label={t('save-button')}
                    />
                </div>
            </Form>
        </Modal>
    )
}
