import { type FC, useEffect, useState } from 'react'

import { mdiWebhook } from '@mdi/js'
import { noop } from 'lodash'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useMutation } from '@sourcegraph/http-client'
import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { Container, ErrorAlert, Form, Input, PageHeader } from '@sourcegraph/wildcard'

import { PageTitle } from '../../components/PageTitle'
import type { CreateOutboundWebhookResult, CreateOutboundWebhookVariables } from '../../graphql-operations'
import { generateSecret } from '../../util/security'

import { CREATE_OUTBOUND_WEBHOOK } from './backend'
import { EventTypes } from './create-edit/EventTypes'
import { SubmitButton } from './create-edit/SubmitButton'

export interface CreatePageProps extends TelemetryProps, TelemetryV2Props {}

export const CreatePage: FC<CreatePageProps> = ({ telemetryService, telemetryRecorder }) => {
    const { t } = useTranslation('site-admin/outbound-webhooks')

    const navigate = useNavigate()
    useEffect(() => {
        telemetryService.logPageView('OutboundWebhooksCreatePage')
        telemetryRecorder.recordEvent('admin.outboundWebhooks.create', 'view')
    }, [telemetryService, telemetryRecorder])

    const [url, setURL] = useState('')
    const [secret, setSecret] = useState(generateSecret())
    const [eventTypes, setEventTypes] = useState<Set<string>>(new Set())

    const [createWebhook, { error: createError, loading }] = useMutation<
        CreateOutboundWebhookResult,
        CreateOutboundWebhookVariables
    >(CREATE_OUTBOUND_WEBHOOK, {
        variables: {
            input: {
                eventTypes: [...eventTypes].map(eventType => ({
                    eventType,
                })),
                secret,
                url,
            },
        },
        onCompleted: () => navigate('/site-admin/webhooks/outgoing'),
    })

    return (
        <div>
            <PageTitle title={t('create-outgoing-webhook')} />
            <PageHeader
                path={[
                    { icon: mdiWebhook },
                    { to: '/site-admin/webhooks/outgoing', text: 'Outgoing webhooks' },
                    { text: 'Create' },
                ]}
                headingElement="h2"
                description={t('create-new-outgoing-webhook')}
                className="mb-3"
            />

            <Container>
                {createError && <ErrorAlert error={createError} />}
                <Form>
                    <Input
                        label={t('url')}
                        required={true}
                        value={url}
                        onChange={event => setURL(event.target.value)}
                    />
                    <Input
                        label={t('secret')}
                        message={<small>{t('randomly-generated-alter-as-required')}</small>}
                        required={true}
                        value={secret}
                        onChange={event => setSecret(event.target.value)}
                    />
                    <EventTypes className="border-top pt-2" values={eventTypes} onChange={setEventTypes} />
                    <SubmitButton
                        onClick={() => {
                            createWebhook().catch(noop)
                        }}
                        state={loading ? 'loading' : eventTypes.size === 0 ? 'disabled' : undefined}
                    >
                        {t('create-action')}
                    </SubmitButton>
                </Form>
            </Container>
        </div>
    )
}
