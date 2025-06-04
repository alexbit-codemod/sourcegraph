import React, { useEffect, useState } from 'react'

import { useTranslation, Trans } from 'react-i18next'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { EVENT_LOGGER } from '@sourcegraph/shared/src/telemetry/web/eventLogger'
import { Text, Link, ErrorAlert, Form, Input, TextArea, Container, Alert } from '@sourcegraph/wildcard'

import { LoaderButton } from '../components/LoaderButton'
import { PageTitle } from '../components/PageTitle'
import type { SourcegraphContext } from '../jscontext'
import { PageRoutes } from '../routes.constants'
import { checkRequestAccessAllowed } from '../util/checkRequestAccessAllowed'

import { AuthPageWrapper } from './AuthPageWrapper'
import { getReturnTo } from './SignInSignUpCommon'

import styles from './RequestAccessPage.module.scss'

export interface RequestAccessFormProps {
    onSuccess: () => void
    onError: (error?: any) => void
    xhrHeaders: SourcegraphContext['xhrHeaders']
}

/**
 * The request access form smart component.
 * It handles the form submission.
 */
const RequestAccessForm: React.FunctionComponent<RequestAccessFormProps> = ({ onSuccess, onError, xhrHeaders }) => {
    const { t } = useTranslation('auth')

    const [loading, setLoading] = useState<boolean>(false)
    const [email, setEmail] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [additionalInfo, setAdditionalInfo] = useState<string>('')

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        if (loading) {
            return
        }
        setLoading(true)
        onError(undefined)
        try {
            const response = await fetch('/-/request-access', {
                credentials: 'same-origin',
                method: 'POST',
                headers: {
                    ...xhrHeaders,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    name,
                    additionalInfo,
                }),
            })

            if (!response.ok) {
                const text = await response.text()
                onError(new Error(response.statusText + ': ' + text))
            } else {
                onSuccess()
            }
        } catch (error) {
            onError(error)
        } finally {
            setLoading(false)
        }
    }
    return (
        <Form onSubmit={handleSubmit} className="mb-0" data-testid="request-access-form">
            <Input
                id="name"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
                required={true}
                value={name}
                disabled={loading}
                autoCapitalize="off"
                autoFocus={true}
                placeholder={t('your-name')}
                autoComplete="name"
                label={t('name-label')}
            />

            <Input
                id="email"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                required={true}
                value={email}
                disabled={loading}
                autoCapitalize="off"
                autoFocus={true}
                placeholder={t('work-email-access')}
                autoComplete="email"
                label={t('email-address-label')}
            />

            <TextArea
                id="additionalInfo"
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setAdditionalInfo(event.target.value)}
                value={additionalInfo}
                placeholder={t('extra-info-access-request')}
                label={t('notes-for-admin')}
                className="mb-3"
            />

            <LoaderButton
                display="block"
                loading={loading}
                type="submit"
                disabled={loading}
                variant="primary"
                label={t('request-access-button')}
            />
        </Form>
    )
}

export interface RequestAccessPageProps extends TelemetryV2Props {}

/**
 * The request access page component.
 */
export const RequestAccessPage: React.FunctionComponent<RequestAccessPageProps> = ({ telemetryRecorder }) => {
    const { t } = useTranslation('auth')

    useEffect(() => {
        EVENT_LOGGER.logPageView('RequestAccessPage')
        telemetryRecorder.recordEvent('auth.requestAccess', 'view')
    }, [telemetryRecorder])
    const location = useLocation()
    const navigate = useNavigate()
    const [error, setError] = useState<Error | null>(null)
    const { sourcegraphDotComMode, isAuthenticatedUser, xhrHeaders } = window.context
    const isRequestAccessAllowed = checkRequestAccessAllowed(window.context)

    if (isAuthenticatedUser) {
        const returnTo = getReturnTo(location)
        return <Navigate to={returnTo} replace={true} />
    }

    if (!isRequestAccessAllowed) {
        return <Navigate to={PageRoutes.SignIn} replace={true} />
    }

    return (
        <>
            <PageTitle title={t('duplicate-request-access-button')} />
            <AuthPageWrapper
                title="Request access to Sourcegraph"
                sourcegraphDotComMode={sourcegraphDotComMode}
                className={styles.wrapper}
            >
                {error && <ErrorAlert error={error} />}
                <Routes>
                    <Route
                        path="done"
                        element={
                            <Container>
                                <Alert variant="info" data-testid="request-access-post-submit" className="mb-0">
                                    {t('thank-you-request-notification')}
                                </Alert>
                            </Container>
                        }
                    />
                    <Route
                        path=""
                        element={
                            <>
                                <Container>
                                    <RequestAccessForm
                                        onError={setError}
                                        xhrHeaders={xhrHeaders}
                                        onSuccess={() => navigate('done')}
                                    />
                                </Container>
                                <Text className="text-center mt-3">
                                    <Trans
                                        i18nKey="already-have-account-sign-in"
                                        components={{ '0': <Link to={`/sign-in${location.search}`} /> }}
                                    />
                                </Text>
                            </>
                        }
                    />
                </Routes>
            </AuthPageWrapper>
        </>
    )
}
