import React, { useCallback, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

// eslint-disable-next-line no-restricted-imports
import { logger } from '@sourcegraph/common/src/util/logger'
import { useMutation, useQuery } from '@sourcegraph/http-client'
import { ErrorAlert, Text, H3, LoadingSpinner, PageHeader, Input, Container } from '@sourcegraph/wildcard'

import { LoaderButton } from '../../../components/LoaderButton'
import { PageTitle } from '../../../components/PageTitle'
import type { Scalars } from '../../../graphql-operations'

import { SET_USER_CODE_COMPLETIONS_QUOTA, SET_USER_COMPLETIONS_QUOTA, USER_REQUEST_QUOTAS } from './backend'

interface Props {
    user: {
        id: Scalars['ID']
    }
}

export const UserQuotaProfilePage: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    user: { id: userID },
}) => {
    const { t } = useTranslation('user/settings/quota')

    const { data, loading, error } = useQuery(USER_REQUEST_QUOTAS, { variables: { userID } })
    const [quota, setQuota] = useState<string>('')
    const [codeCompletionsQuota, setCodeCompletionsQuota] = useState<string>('')

    const [
        setUserCompletionsQuota,
        {
            data: setCompletionsQuotaResponse,
            loading: setUserCompletionsQuotaLoading,
            error: setUserCompletionsQuotaError,
        },
    ] = useMutation(SET_USER_COMPLETIONS_QUOTA)

    const [
        setUserCodeCompletionsQuota,
        {
            data: setCodeCompletionsQuotaResponse,
            loading: setUserCodeCompletionsQuotaLoading,
            error: setUserCodeCompletionsQuotaError,
        },
    ] = useMutation(SET_USER_CODE_COMPLETIONS_QUOTA)

    useEffect(() => {
        if (data?.node?.__typename === 'User' && data.node.completionsQuotaOverride !== null) {
            setQuota(data.node.completionsQuotaOverride)
        } else {
            // No overridden limit.
            setQuota('')
        }
        if (data?.node?.__typename === 'User' && data.node.codeCompletionsQuotaOverride !== null) {
            setCodeCompletionsQuota(data.node.codeCompletionsQuotaOverride)
        } else {
            // No overridden limit.
            setCodeCompletionsQuota('')
        }
    }, [data])

    useEffect(() => {
        if (setCompletionsQuotaResponse) {
            if (setCompletionsQuotaResponse.completionsQuotaOverride !== null) {
                setQuota(setCompletionsQuotaResponse.completionsQuotaOverride)
            } else {
                // No overridden limit.
                setQuota('')
            }
        }
    }, [setCompletionsQuotaResponse])

    useEffect(() => {
        if (setCodeCompletionsQuotaResponse) {
            if (setCodeCompletionsQuotaResponse.codeCompletionsQuotaOverride !== null) {
                setCodeCompletionsQuota(setCodeCompletionsQuotaResponse.codeCompletionsQuotaOverride)
            } else {
                // No overridden limit.
                setCodeCompletionsQuota('')
            }
        }
    }, [setCodeCompletionsQuotaResponse])

    const storeCompletionsQuota = useCallback(() => {
        setUserCompletionsQuota({ variables: { userID, quota: quota === '' ? null : parseInt(quota, 10) } }).catch(
            error => {
                logger.error(error)
            }
        )
    }, [quota, userID, setUserCompletionsQuota])

    const storeCodeCompletionsQuota = useCallback(() => {
        setUserCodeCompletionsQuota({
            variables: { userID, quota: codeCompletionsQuota === '' ? null : parseInt(codeCompletionsQuota, 10) },
        }).catch(error => {
            logger.error(error)
        })
    }, [codeCompletionsQuota, userID, setUserCodeCompletionsQuota])

    if (loading) {
        return <LoadingSpinner />
    }

    if (error) {
        return <ErrorAlert error={error} />
    }

    return (
        <>
            <PageTitle title={t('user-quotas')} />
            <PageHeader
                path={[{ text: 'Quotas' }]}
                headingElement="h2"
                description={<>{t('configure-custom-quotas-description')}</>}
                className="mb-3"
            />
            <Container className="mb-3">
                <H3>{t('completions')}</H3>
                <Text>{t('completions-api-request-limit-description')}</Text>
                <div className="d-flex justify-content-between align-items-end mb-5">
                    <Input
                        id="completions-quota"
                        name="completions-quota"
                        type="number"
                        value={quota}
                        onChange={event => setQuota(event.currentTarget.value)}
                        spellCheck={false}
                        min={1}
                        disabled={setUserCompletionsQuotaLoading}
                        placeholder={t('global-completions-limit', {
                            dataSitePerUserCompletionsQuotaNullInfiniteDataSitePerUserCompletionsQuota:
                                data?.site.perUserCompletionsQuota === null
                                    ? 'infinite'
                                    : data?.site.perUserCompletionsQuota,
                        })}
                        label={t('custom-completions-quota')}
                        className="flex-grow-1 mb-0"
                    />
                    <LoaderButton
                        loading={setUserCompletionsQuotaLoading}
                        label={t('save')}
                        onClick={storeCompletionsQuota}
                        disabled={setUserCompletionsQuotaLoading}
                        variant="primary"
                        className="ml-2"
                    />
                </div>
                {setUserCompletionsQuotaError && <ErrorAlert error={setUserCompletionsQuotaError} className="mb-0" />}
                <Text>{t('code-completions-api-request-limit-description')}</Text>
                <div className="d-flex justify-content-between align-items-end">
                    <Input
                        id="code-completions-quota"
                        name="code-completions-quota"
                        type="number"
                        value={codeCompletionsQuota}
                        onChange={event => setCodeCompletionsQuota(event.currentTarget.value)}
                        spellCheck={false}
                        min={1}
                        disabled={setUserCodeCompletionsQuotaLoading}
                        placeholder={t('global-code-completions-limit', {
                            dataSitePerUserCodeCompletionsQuotaNullInfiniteDataSitePerUserCodeCompletionsQuota:
                                data?.site.perUserCodeCompletionsQuota === null
                                    ? 'infinite'
                                    : data?.site.perUserCodeCompletionsQuota,
                        })}
                        label={t('custom-code-completions-quota')}
                        className="flex-grow-1 mb-0"
                    />
                    <LoaderButton
                        loading={setUserCodeCompletionsQuotaLoading}
                        label={t('save-code-completions')}
                        onClick={storeCodeCompletionsQuota}
                        disabled={setUserCodeCompletionsQuotaLoading}
                        variant="primary"
                        className="ml-2"
                    />
                </div>
                {setUserCodeCompletionsQuotaError && (
                    <ErrorAlert error={setUserCodeCompletionsQuotaError} className="mb-0" />
                )}
            </Container>
        </>
    )
}
