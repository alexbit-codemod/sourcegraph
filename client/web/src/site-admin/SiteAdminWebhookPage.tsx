import { type FC, useEffect, useState, useCallback } from 'react'

import { mdiWebhook, mdiDelete, mdiPencil } from '@mdi/js'
import { useTranslation, Trans } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import {
    Button,
    ButtonLink,
    Container,
    H2,
    H5,
    Link,
    PageHeader,
    ErrorAlert,
    Icon,
    Alert,
    Text,
    Code,
} from '@sourcegraph/wildcard'

import { CreatedByAndUpdatedByInfoByline } from '../components/Byline/CreatedByAndUpdatedByInfoByline'
import {
    ConnectionContainer,
    ConnectionError,
    ConnectionList,
    ConnectionLoading,
    ConnectionSummary,
    ShowMoreButton,
    SummaryContainer,
} from '../components/FilteredConnection/ui'
import { PageTitle } from '../components/PageTitle'
import { ExternalServiceKind, type WebhookFields } from '../graphql-operations'

import { useWebhookLogsConnection, useWebhookQuery } from './backend'
import { WebhookConfirmDeleteModal } from './WebhookConfirmDeleteModal'
import { WebhookInfoLogPageHeader } from './WebhookInfoLogPageHeader'
import { WebhookInformation } from './WebhookInformation'
import { WebhookLogNode } from './webhooks/WebhookLogNode'

import styles from './SiteAdminWebhookPage.module.scss'

export interface WebhookPageProps extends TelemetryProps, TelemetryV2Props {}

export const SiteAdminWebhookPage: FC<WebhookPageProps> = props => {
    const { t } = useTranslation('site-admin')

    const { telemetryService, telemetryRecorder } = props

    const { id = '' } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [onlyErrors, setOnlyErrors] = useState(false)
    const {
        loading,
        hasNextPage,
        fetchMore,
        connection,
        error: webhookLogsError,
    } = useWebhookLogsConnection(id, 20, onlyErrors)
    const { loading: webhookLoading, data: webhookData, error: webhookError } = useWebhookQuery(id)

    useEffect(() => {
        telemetryService.logPageView('SiteAdminWebhook')
        telemetryRecorder.recordEvent('admin.webhook', 'view')
    }, [telemetryService, telemetryRecorder])

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const deleteWebhook = useCallback(() => {
        setShowDeleteModal(true)
    }, [])

    return (
        <>
            <PageTitle title={t('incoming-webhooks')} />
            {webhookLoading && !webhookData && <ConnectionLoading />}
            {!webhookLoading && !webhookData && webhookError && <ErrorAlert error={webhookError} />}
            {webhookData?.node && webhookData.node.__typename === 'Webhook' && (
                <PageHeader
                    path={[
                        { icon: mdiWebhook },
                        { to: '/site-admin/webhooks/incoming', text: 'Incoming webhooks' },
                        { text: webhookData.node.name },
                    ]}
                    byline={
                        <CreatedByAndUpdatedByInfoByline
                            createdAt={webhookData.node.createdAt}
                            createdBy={webhookData.node.createdBy}
                            updatedAt={webhookData.node.updatedAt}
                            updatedBy={webhookData.node.updatedBy}
                        />
                    }
                    className="mb-3"
                    headingElement="h2"
                    actions={
                        <div className="d-flex flex-row align-items-center">
                            <ButtonLink
                                to={`/site-admin/webhooks/incoming/${id}/edit`}
                                className="test-edit-webhook mr-2"
                                variant="secondary"
                                display="inline"
                            >
                                <Icon aria-hidden={true} svgPath={mdiPencil} />
                                {t('edit')}
                            </ButtonLink>
                            <Button
                                aria-label="Delete"
                                className="test-delete-webhook"
                                variant="danger"
                                disabled={showDeleteModal}
                                onClick={deleteWebhook}
                            >
                                <Icon aria-hidden={true} svgPath={mdiDelete} />
                                {t('delete')}
                            </Button>
                        </div>
                    }
                />
            )}
            <Container className="mb-3">
                <H2>{t('information')}</H2>
                {webhookData?.node && webhookData.node.__typename === 'Webhook' && (
                    <WebhookInformation webhook={webhookData.node as WebhookFields} />
                )}

                <H2>{t('logs')}</H2>
                <WebhookInfoLogPageHeader webhookID={id} onlyErrors={onlyErrors} onSetOnlyErrors={setOnlyErrors} />

                <ConnectionContainer className="mt-5">
                    {webhookLogsError && <ConnectionError errors={[webhookLogsError.message]} />}
                    {loading && !connection && <ConnectionLoading />}

                    <ConnectionList aria-label="WebhookLogs" className={styles.logs}>
                        <SiteAdminWebhookPageHeader timeLabel={t('received-at')} />
                        {connection?.nodes?.map(node => (
                            <WebhookLogNode doNotShowExternalService={true} key={node.id} node={node} />
                        ))}
                    </ConnectionList>

                    {connection && (
                        <SummaryContainer className="mt-2">
                            <ConnectionSummary
                                noSummaryIfAllNodesVisible={false}
                                first={connection.totalCount ?? 0}
                                centered={true}
                                connection={connection}
                                noun="webhook log"
                                pluralNoun="webhook logs"
                                hasNextPage={hasNextPage}
                                emptyElement={<EmptyList onlyErrors={onlyErrors} />}
                            />
                            {hasNextPage && <ShowMoreButton centered={true} onClick={fetchMore} />}
                        </SummaryContainer>
                    )}
                </ConnectionContainer>
            </Container>

            {webhookData?.node && webhookData.node.__typename === 'Webhook' && (
                <>
                    <H2>{t('setup-instructions')}</H2>
                    <Container>
                        <WebhookSetupInstructions webhook={webhookData.node} />
                    </Container>
                </>
            )}

            {showDeleteModal && webhookData?.node && webhookData.node.__typename === 'Webhook' && (
                <WebhookConfirmDeleteModal
                    webhook={webhookData.node}
                    onCancel={() => setShowDeleteModal(false)}
                    afterDelete={() => navigate('/site-admin/webhooks/incoming')}
                    telemetryRecorder={telemetryRecorder}
                />
            )}
        </>
    )
}

export interface SiteAdminWebhookPageHeaderProps {
    middleColumnLabel?: string
    timeLabel: string
}

export const SiteAdminWebhookPageHeader: FC<SiteAdminWebhookPageHeaderProps> = ({ middleColumnLabel, timeLabel }) => {
    const { t } = useTranslation('site-admin')

    return (
        <>
            {/* Render an empty element here to fill in available space for the first column*/}
            {/* element in the header row*/}
            <span className="d-md-block" />
            <H5 className="text-uppercase text-center text-nowrap">{t('status-code')}</H5>
            <H5 className="text-uppercase text-nowrap">{middleColumnLabel}</H5>
            <H5 className="text-uppercase text-nowrap">{timeLabel}</H5>
        </>
    )
}

const EmptyList: FC<{ onlyErrors: boolean }> = ({ onlyErrors }) => {
    const { t } = useTranslation('site-admin')

    return (
        <div className="m-4 w-100 text-center text-muted">
            {onlyErrors ? (
                'No errors have been received from this webhook recently.'
            ) : (
                <>
                    <Trans
                        i18nKey="no-requests-received"
                        components={{
                            '0': (
                                <Link to="/help/admin/config/webhooks/incoming#configuring-webhooks-on-the-code-host" />
                            ),
                        }}
                    />
                </>
            )}
        </div>
    )
}

interface WebhookSetupInstructionsProps {
    webhook: WebhookFields
}

const WebhookSetupInstructions: React.FunctionComponent<WebhookSetupInstructionsProps> = ({ webhook }) => {
    const { t } = useTranslation('site-admin')

    if (webhook.codeHostKind === ExternalServiceKind.GITHUB) {
        return (
            <>
                <Text>
                    <Trans
                        i18nKey="setup-github-webhook"
                        components={{ '0': <Link to="/help/admin/config/webhooks/incoming#github" /> }}
                    />
                </Text>
                <Alert variant="info">{t('github-app-webhooks-note')}</Alert>
                <Text className="mb-0">
                    <ol className="mb-0">
                        <li>
                            <Trans
                                i18nKey="copy-webhook-url"
                                values={{ webhookUrl: <>{webhook.url}</> }}
                                components={{ '0': <strong /> }}
                            />
                        </li>
                        <li>
                            <Trans
                                i18nKey="github-settings-webhook-setup"
                                components={{ '0': <strong />, '1': <strong />, '2': <strong /> }}
                            />
                        </li>
                        <li>
                            {t('fill-webhook-form')}
                            <ul>
                                <li>{t('payload-url-description')}</li>
                                <li>
                                    <Trans i18nKey="content-type-requirement" components={{ '0': <strong /> }} />
                                </li>
                                <li>{t('secret-token-description')}</li>
                                <li>{t('active-status-requirement')}</li>
                                <li>
                                    <Trans i18nKey="select-events-description" components={{ '0': <strong /> }} />
                                    <table className="table ml-3">
                                        <thead>
                                            <tr>
                                                <th className="px-2">{t('repo-updates')}</th>
                                                <th className="px-2">{t('batch-changes')}</th>
                                                <th className="px-2">{t('repo-permissions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <ul>
                                                        <li>
                                                            <Code>{t('push-event')}</Code>
                                                        </li>
                                                    </ul>
                                                </td>
                                                <td>
                                                    <ul>
                                                        <li>
                                                            <Code>{t('issue-comments')}</Code>
                                                        </li>
                                                        <li>
                                                            <Code>{t('pull-requests')}</Code>
                                                        </li>
                                                        <li>
                                                            <Code>{t('pull-request-reviews')}</Code>
                                                        </li>
                                                        <li>
                                                            <Code>{t('pull-request-review-comments')}</Code>
                                                        </li>
                                                        <li>
                                                            <Code>{t('check-runs')}</Code>
                                                        </li>
                                                        <li>
                                                            <Code>{t('check-suites')}</Code>
                                                        </li>
                                                        <li>
                                                            <Code>{t('statuses')}</Code>
                                                        </li>
                                                    </ul>
                                                </td>
                                                <td>
                                                    <ul>
                                                        <li>
                                                            <Code>{t('collaborator-changes')}</Code>
                                                        </li>
                                                        <li>
                                                            <Code>{t('memberships')}</Code>
                                                        </li>
                                                        <li>
                                                            <Code>{t('organizations')}</Code>
                                                        </li>
                                                        <li>
                                                            <Code>{t('repositories')}</Code>
                                                        </li>
                                                        <li>
                                                            <Code>{t('teams')}</Code>
                                                        </li>
                                                    </ul>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <Trans i18nKey="click-add-webhook" components={{ '0': <strong /> }} />
                        </li>
                        <li>{t('confirm-webhook-listing')}</li>
                        <li>{t('initial-ping-event')}</li>
                    </ol>
                </Text>
            </>
        )
    }
    if (webhook.codeHostKind === ExternalServiceKind.GITLAB) {
        return (
            <>
                <Text className="mb-0">
                    <Trans
                        i18nKey="setup-gitlab-webhook"
                        components={{ '0': <Link to="/help/admin/config/webhooks/incoming#gitlab" /> }}
                    />
                </Text>
            </>
        )
    }
    if (webhook.codeHostKind === ExternalServiceKind.BITBUCKETSERVER) {
        return (
            <>
                <Text className="mb-0">
                    <Trans
                        i18nKey="setup-bitbucket-server-webhook"
                        components={{ '0': <Link to="/help/admin/config/webhooks/incoming#bitbucket-server" /> }}
                    />
                </Text>
            </>
        )
    }
    if (webhook.codeHostKind === ExternalServiceKind.BITBUCKETCLOUD) {
        return (
            <>
                <Text className="mb-0">
                    <Trans
                        i18nKey="setup-bitbucket-cloud-webhook"
                        components={{ '0': <Link to="/help/admin/config/webhooks/incoming#bitbucket-cloud" /> }}
                    />
                </Text>
            </>
        )
    }
    if (webhook.codeHostKind === ExternalServiceKind.AZUREDEVOPS) {
        return (
            <>
                <Text className="mb-0">
                    <Trans
                        i18nKey="setup-azure-devops-webhook"
                        components={{ '0': <Link to="/help/admin/config/webhooks/incoming#azure-devops" /> }}
                    />
                </Text>
            </>
        )
    }
    return null
}
