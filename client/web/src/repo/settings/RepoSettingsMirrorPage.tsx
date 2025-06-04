import React, { type FC, useEffect, useState } from 'react'

import { mdiChevronDown, mdiChevronUp, mdiLock } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'

import { Timestamp } from '@sourcegraph/branded/src/components/Timestamp'
import { useMutation, useQuery } from '@sourcegraph/http-client'
import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { EVENT_LOGGER } from '@sourcegraph/shared/src/telemetry/web/eventLogger'
import {
    Container,
    PageHeader,
    LoadingSpinner,
    FeedbackText,
    Button,
    Link,
    Alert,
    Icon,
    Input,
    Text,
    Code,
    ErrorAlert,
    CollapseHeader,
    Collapse,
    CollapsePanel,
    Label,
} from '@sourcegraph/wildcard'

import { PageTitle } from '../../components/PageTitle'
import type {
    CheckMirrorRepositoryConnectionResult,
    CheckMirrorRepositoryConnectionVariables,
    RecloneRepositoryResult,
    RecloneRepositoryVariables,
    SettingsAreaRepositoryFields,
    SettingsAreaRepositoryResult,
    SettingsAreaRepositoryVariables,
    UpdateMirrorRepositoryResult,
    UpdateMirrorRepositoryVariables,
} from '../../graphql-operations'
import {
    CHECK_MIRROR_REPOSITORY_CONNECTION,
    RECLONE_REPOSITORY_MUTATION,
    UPDATE_MIRROR_REPOSITORY,
} from '../../site-admin/backend'
import { DirectImportRepoAlert } from '../DirectImportRepoAlert'

import { FETCH_SETTINGS_AREA_REPOSITORY_GQL } from './backend'
import { ActionContainer, BaseActionContainer } from './components/ActionContainer'
import { RepoSettingsOptions } from './RepoSettingsOptions'

import styles from './RepoSettingsMirrorPage.module.scss'

interface UpdateMirrorRepositoryActionContainerProps {
    repo: SettingsAreaRepositoryFields
    onDidUpdateRepository: () => Promise<void>
    disabled: boolean
    disabledReason: string | undefined
}

const UpdateMirrorRepositoryActionContainer: FC<UpdateMirrorRepositoryActionContainerProps> = props => {
    const { t } = useTranslation('repo/settings')

    const [updateRepo] = useMutation<UpdateMirrorRepositoryResult, UpdateMirrorRepositoryVariables>(
        UPDATE_MIRROR_REPOSITORY,
        { variables: { repository: props.repo.id } }
    )

    const run = async (): Promise<void> => {
        await updateRepo()
        await props.onDidUpdateRepository()
    }

    let title: React.ReactNode
    let description: React.ReactNode
    let buttonLabel: React.ReactNode
    let buttonDisabled = false
    let info: React.ReactNode
    if (props.repo.mirrorInfo.cloneInProgress) {
        title = 'Cloning in progress...'
        description = props.repo.mirrorInfo.cloneProgress ? (
            <div className="overflow-auto">
                <Code>{props.repo.mirrorInfo.cloneProgress}</Code>
            </div>
        ) : (
            'This repository is currently being cloned from its remote repository.'
        )
        buttonLabel = (
            <span>
                <LoadingSpinner />
                {t('cloning-in-progress')}
            </span>
        )
        buttonDisabled = true
        info = <DirectImportRepoAlert className={classNames(styles.alert, 'mb-0')} />
    } else if (props.repo.mirrorInfo.cloned) {
        const updateSchedule = props.repo.mirrorInfo.updateSchedule
        title = (
            <>
                <div>
                    {t('last-refreshed')}
                    {props.repo.mirrorInfo.updatedAt ? (
                        <Timestamp date={props.repo.mirrorInfo.updatedAt} />
                    ) : (
                        'unknown'
                    )}{' '}
                </div>
            </>
        )
        info = (
            <>
                {updateSchedule && (
                    <div>
                        {t('next-scheduled-update')}
                        <Timestamp date={updateSchedule.due} />
                        {t('scheduled-update-position', { updateScheduleIndex1: updateSchedule.index + 1 })}
                        {updateSchedule.total}
                        {t('scheduled-update-info')}
                    </div>
                )}
                {props.repo.mirrorInfo.updateQueue && !props.repo.mirrorInfo.updateQueue.updating && (
                    <div>
                        {t('queued-for-update', {
                            propsRepoMirrorInfoUpdateQueueIndex1: props.repo.mirrorInfo.updateQueue.index + 1,
                        })}
                        {props.repo.mirrorInfo.updateQueue.total}
                        {t('queue-position-info')}
                    </div>
                )}
            </>
        )
        if (!updateSchedule) {
            description = 'This repository is automatically updated when accessed by a user.'
        } else {
            description =
                'This repository is automatically updated from its remote repository periodically and when accessed by a user.'
        }
        buttonLabel = 'Refresh now'
    } else {
        title = 'Clone this repository'
        description = 'This repository has not yet been cloned from its remote repository.'
        buttonLabel = 'Clone now'
    }

    return (
        <ActionContainer
            title={title}
            titleAs="h3"
            description={description}
            buttonLabel={buttonLabel}
            buttonDisabled={buttonDisabled || props.disabled}
            buttonSubtitle={props.disabledReason}
            flashText={t('added-to-queue')}
            info={info}
            run={run}
        />
    )
}

interface CheckMirrorRepositoryConnectionActionContainerProps {
    repo: SettingsAreaRepositoryFields
    onDidUpdateReachability: (reachable: boolean) => void
}

const CheckMirrorRepositoryConnectionActionContainer: FC<
    CheckMirrorRepositoryConnectionActionContainerProps
> = props => {
    const { t } = useTranslation('repo/settings')

    const [checkConnection, { data, loading, error }] = useMutation<
        CheckMirrorRepositoryConnectionResult,
        CheckMirrorRepositoryConnectionVariables
    >(CHECK_MIRROR_REPOSITORY_CONNECTION, {
        variables: { repository: props.repo.id },
        onCompleted: result => {
            props.onDidUpdateReachability(result.checkMirrorRepositoryConnection.error === null)
        },
        onError: () => {
            props.onDidUpdateReachability(false)
        },
    })

    useEffect(() => {
        checkConnection().catch(() => {})
    }, [checkConnection])

    return (
        <BaseActionContainer
            title={t('check-connection-remote-repo')}
            titleAs="h3"
            description={<span>{t('diagnose-cloning-problems')}</span>}
            action={
                <Button
                    disabled={loading}
                    onClick={() => {
                        checkConnection().catch(() => {})
                    }}
                    variant="primary"
                >
                    {t('check-connection')}
                </Button>
            }
            details={
                <>
                    {error && <ErrorAlert className={styles.alert} error={error} />}
                    {loading && (
                        <Alert className={classNames('mb-0', styles.alert)} variant="primary">
                            <LoadingSpinner />
                            {t('checking-connection')}
                        </Alert>
                    )}
                    {data &&
                        !loading &&
                        (data.checkMirrorRepositoryConnection.error === null ? (
                            <Alert className={classNames('mb-0', styles.alert)} variant="success">
                                {t('remote-repo-reachable')}
                            </Alert>
                        ) : (
                            <Alert className={classNames('mb-0', styles.alert)} variant="danger">
                                <Text>{t('remote-repo-unreachable')}</Text>
                                <div>
                                    <pre className={styles.log}>
                                        <Code>{data.checkMirrorRepositoryConnection.error}</Code>
                                    </pre>
                                </div>
                            </Alert>
                        ))}
                </>
            }
            className="mb-0"
        />
    )
}

// Add interface for props then create component
interface CorruptionLogProps {
    repo: SettingsAreaRepositoryFields
}

const CorruptionLogsContainer: FC<CorruptionLogProps> = props => {
    const { t } = useTranslation('repo/settings')

    const health = props.repo.mirrorInfo.isCorrupted ? (
        <>
            <Alert className={classNames('mb-0', styles.alert)} variant="danger">
                {t('repository-corrupt-warning')}
            </Alert>
            <br />
        </>
    ) : null

    const logEvents: JSX.Element[] = props.repo.mirrorInfo.corruptionLogs.map(log => (
        <li key={`${props.repo.name}#${log.timestamp}`} className="list-group-item px-2 py-1">
            <div className="d-flex flex-column align-items-center justify-content-between">
                <Text className={classNames('overflow-auto', 'text-monospace', styles.log)}>{log.reason}</Text>
                <small className="text-muted mb-0">
                    <Timestamp date={log.timestamp} />
                </small>
            </div>
        </li>
    ))

    const [isOpened, setIsOpened] = useState(false)
    const hasLogs = logEvents.length !== 0

    return (
        <BaseActionContainer
            title={t('repository-corruption')}
            titleAs="h3"
            description={<span>{t('recent-corruption-events')}</span>}
            className="mb-0"
            details={
                <div className="flex-1">
                    {health}
                    {!hasLogs && <Text className="mt-3 text-muted text-center mb-0">{t('no-corruption-history')}</Text>}
                    {hasLogs && (
                        <Collapse isOpen={isOpened} onOpenChange={setIsOpened}>
                            <CollapseHeader
                                as={Button}
                                outline={true}
                                focusLocked={true}
                                variant="secondary"
                                className="w-100 my-2"
                                disabled={!hasLogs}
                            >
                                {t('show-corruption-history')}
                                <Icon
                                    aria-hidden={true}
                                    svgPath={isOpened ? mdiChevronUp : mdiChevronDown}
                                    className="mr-1"
                                />
                            </CollapseHeader>
                            <CollapsePanel>
                                <ul className="list-group">{logEvents}</ul>
                            </CollapsePanel>
                        </Collapse>
                    )}
                </div>
            }
        />
    )
}

interface RepoSettingsMirrorPageProps extends TelemetryV2Props {
    repo: SettingsAreaRepositoryFields
    disablePolling?: boolean
}

/**
 * The repository settings mirror page.
 */
export const RepoSettingsMirrorPage: FC<RepoSettingsMirrorPageProps> = ({
    repo: initialRepo,
    disablePolling = false,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('repo/settings')

    useEffect(() => {
        EVENT_LOGGER.logPageView('RepoSettingsMirror')
        telemetryRecorder.recordEvent('repo.settings.mirror', 'view')
    }, [telemetryRecorder])

    const [reachable, setReachable] = useState<boolean>()
    const [recloneRepository] = useMutation<RecloneRepositoryResult, RecloneRepositoryVariables>(
        RECLONE_REPOSITORY_MUTATION,
        {
            variables: { repo: initialRepo.id },
        }
    )

    const { data, error, refetch } = useQuery<SettingsAreaRepositoryResult, SettingsAreaRepositoryVariables>(
        FETCH_SETTINGS_AREA_REPOSITORY_GQL,
        {
            variables: { name: initialRepo.name },
            pollInterval: disablePolling ? undefined : 3000,
        }
    )

    const repo = data?.repository ? data.repository : initialRepo

    const onDidUpdateReachability = (reachable: boolean | undefined): void => setReachable(reachable)

    return (
        <>
            <PageTitle title={t('mirror-settings')} />
            <PageHeader path={[{ text: 'Mirroring and cloning' }]} headingElement="h2" className="mb-3" />
            <RepoSettingsOptions repo={repo} />
            <Container className="repo-settings-mirror-page">
                {error && <ErrorAlert error={error} />}

                <div className="form-group">
                    <Label>
                        <Trans i18nKey="remote-repo-url-info" components={{ '0': <small className="text-muted" /> }} />
                    </Label>
                    <Input value={repo.mirrorInfo.remoteURL || '(unknown)'} readOnly={true} className="mb-0" />
                    {repo.viewerCanAdminister && (
                        <small className="form-text text-muted">
                            <Trans
                                i18nKey="configure-repo-mirroring"
                                components={{ '0': <Link to="/site-admin/external-services" /> }}
                            />
                        </small>
                    )}
                </div>
                {repo.mirrorInfo.lastError && (
                    <Alert variant="warning">
                        {/* TODO: This should not be a list item, but it was before this was refactored. */}
                        <li className="d-flex w-100">{t('error-updating-repo')}</li>
                        <li className="d-flex w-100">{repo.mirrorInfo.lastError}</li>
                    </Alert>
                )}
                <UpdateMirrorRepositoryActionContainer
                    repo={repo}
                    onDidUpdateRepository={async () => {
                        await refetch()
                    }}
                    disabled={typeof reachable === 'boolean' && !reachable}
                    disabledReason={typeof reachable === 'boolean' && !reachable ? 'Not reachable' : undefined}
                />
                <ActionContainer
                    title={t('reclone-repository')}
                    titleAs="h3"
                    description={
                        <div>
                            {t('reclone-warning')}
                            <div className="mt-2">
                                <Trans
                                    i18nKey="reclone-long-process-warning"
                                    components={{ '0': <span className="font-weight-bold text-danger" /> }}
                                />
                            </div>
                        </div>
                    }
                    buttonVariant="danger"
                    buttonLabel={
                        repo.mirrorInfo.cloneInProgress ? (
                            <span>
                                <LoadingSpinner />
                                {t('cloning-in-progress-warning')}
                            </span>
                        ) : (
                            'Reclone'
                        )
                    }
                    buttonDisabled={repo.mirrorInfo.cloneInProgress}
                    flashText={t('recloning-repo')}
                    run={async () => {
                        await recloneRepository()
                    }}
                />
                <CheckMirrorRepositoryConnectionActionContainer
                    repo={repo}
                    onDidUpdateReachability={onDidUpdateReachability}
                />
                {reachable === false && (
                    <Alert variant="info">
                        {t('problems-cloning-repo')}
                        <ul className={styles.steps}>
                            <li className={styles.step}>
                                <Trans i18nKey="inspect-connection-error-log" components={{ '0': <strong /> }} />
                            </li>
                            <li className={styles.step}>
                                <Code weight="bold">{t('host-key-verification-failed')}</Code>
                                <Trans
                                    i18nKey="ssh-authentication-documentation"
                                    components={{
                                        '0': (
                                            <Link to="/help/admin/repo/auth#ssh-authentication-config-keys-known-hosts" />
                                        ),
                                    }}
                                />
                                <Code>{t('known-hosts-file')}</Code>
                                {t('ssh-host-key-info')}
                            </li>
                            <li className={styles.step}>
                                <Trans
                                    i18nKey="sourcegraph-repo-authentication-issues"
                                    components={{ '0': <Link to="/help/admin/repo/add" /> }}
                                />
                            </li>
                            <li className={styles.step}>
                                <FeedbackText headerText={t('questions')} />
                            </li>
                        </ul>
                    </Alert>
                )}
                <CorruptionLogsContainer repo={repo} />
            </Container>
        </>
    )
}
