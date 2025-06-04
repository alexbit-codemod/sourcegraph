import type { FC } from 'react'

import { useApolloClient } from '@apollo/client'
import { useTranslation, Trans } from 'react-i18next'

import { gql, useMutation } from '@sourcegraph/http-client'
import { Button, ErrorAlert, H2, LoadingSpinner, Modal, Text } from '@sourcegraph/wildcard'

import { type SearchJobNode, SearchJobState } from '../../../graphql-operations'
import { SearchJobCard } from '../SearchJobCard/SearchJobCard'

import styles from './SearchJobModal.module.scss'

const DELETE_SEARCH_JOB = gql`
    mutation DeleteSearchJob($id: ID!) {
        deleteSearchJob(id: $id) {
            alwaysNil
        }
    }
`

interface SearchJobModalProps {
    searchJob: SearchJobNode
    onDismiss: () => void
}

export const SearchJobDeleteModal: FC<SearchJobModalProps> = props => {
    const { t } = useTranslation('enterprise/search-jobs/SearchJobModal')

    const { searchJob, onDismiss } = props
    const client = useApolloClient()

    const [deleteSearchJob, { loading, error }] = useMutation(DELETE_SEARCH_JOB, {
        onCompleted: (data, clientOptions) => {
            const deletedSearchJobReference = client.cache.identify({
                __typename: 'SearchJob',
                id: searchJob.id,
            })

            // Delete just deleted search job from the apollo cache
            client.cache.evict({ id: deletedSearchJobReference })
            onDismiss()
        },
    })

    return (
        <Modal position="center" aria-label="Delete search job" onDismiss={onDismiss}>
            <H2>{t('delete-search-job-confirmation')}</H2>

            <Text className="mt-4">
                <Trans i18nKey="delete-search-job-note" components={{ '0': <b /> }} />
            </Text>

            <SearchJobCard searchJob={searchJob} />

            {error && <ErrorAlert error={error} className="mt-3" />}

            <footer className={styles.footer}>
                <Button variant="secondary" outline={true} onClick={onDismiss}>
                    {t('cancel-button')}
                </Button>
                <Button
                    variant="danger"
                    disabled={loading}
                    className={styles.actionButton}
                    onClick={() => deleteSearchJob({ variables: { id: searchJob.id } })}
                >
                    {loading ? (
                        <>
                            <LoadingSpinner />
                            {t('deleting-status')}
                        </>
                    ) : (
                        'Delete'
                    )}
                </Button>
            </footer>
        </Modal>
    )
}

const CANCEL_SEARCH_JOB = gql`
    mutation CancelSearchJob($id: ID!) {
        cancelSearchJob(id: $id) {
            alwaysNil
        }
    }
`

const CREATE_SEARCH_JOB = gql`
    mutation CreateSearchJob($query: String!) {
        createSearchJob(query: $query) {
            id
            query
            state
            URL
            startedAt
            finishedAt
            repoStats {
                total
                completed
                failed
                inProgress
            }
            creator {
                id
                displayName
                username
                avatarURL
            }
        }
    }
`

export const RerunSearchJobModal: FC<SearchJobModalProps> = props => {
    const { t } = useTranslation('enterprise/search-jobs/SearchJobModal')

    const { searchJob, onDismiss } = props

    const [cancelSearchJob, { loading: cancelLoading, error: cancelError }] = useMutation(CANCEL_SEARCH_JOB)
    const [createSearchJob, { loading: creationLoading, error: creationError }] = useMutation(CREATE_SEARCH_JOB)

    const loading = cancelLoading || creationLoading
    const error = cancelError || creationError

    const handleRerunClick = async (): Promise<void> => {
        if (
            searchJob.state !== SearchJobState.COMPLETED &&
            searchJob.state !== SearchJobState.FAILED &&
            searchJob.state !== SearchJobState.CANCELED
        ) {
            await cancelSearchJob({ variables: { id: searchJob.id } })
        }

        await createSearchJob({ variables: { query: searchJob.query } })

        onDismiss()
    }

    return (
        <Modal position="center" aria-label="Delete search job" onDismiss={onDismiss}>
            <H2>{t('rerun-search-job-confirmation')}</H2>

            <Text className="mt-4">
                <Trans i18nKey="rerun-search-job-note" components={{ '0': <b /> }} />
            </Text>

            <SearchJobCard searchJob={searchJob} />

            {error && <ErrorAlert error={error} className="mt-3" />}

            <footer className={styles.footer}>
                <Button variant="secondary" outline={true} onClick={onDismiss}>
                    {t('cancel-button-rerun')}
                </Button>
                <Button
                    variant="primary"
                    disabled={loading}
                    className={styles.actionButton}
                    onClick={() => handleRerunClick()}
                >
                    {loading ? (
                        <>
                            <LoadingSpinner />
                            {t('rerunning-status')}
                        </>
                    ) : (
                        <>{t('rerun-button')}</>
                    )}
                </Button>
            </footer>
        </Modal>
    )
}

export const CancelSearchJobModal: FC<SearchJobModalProps> = props => {
    const { t } = useTranslation('enterprise/search-jobs/SearchJobModal')

    const { searchJob, onDismiss } = props

    const [cancelSearchJob, { loading, error }] = useMutation(CANCEL_SEARCH_JOB, {
        onCompleted: () => {
            onDismiss()
        },
    })

    return (
        <Modal position="center" aria-label="Stop search job" onDismiss={onDismiss}>
            <H2>{t('stop-search-job-confirmation')}</H2>

            <Text className="mt-4">
                <Trans i18nKey="stop-search-job-note" components={{ '0': <b /> }} />
            </Text>

            <SearchJobCard searchJob={searchJob} />

            {error && <ErrorAlert error={error} className="mt-3" />}

            <footer className={styles.footer}>
                <Button variant="secondary" outline={true} onClick={onDismiss}>
                    {t('close-button')}
                </Button>
                <Button
                    variant="danger"
                    disabled={loading}
                    className={styles.actionButton}
                    onClick={() => cancelSearchJob({ variables: { id: searchJob.id } })}
                >
                    {loading ? (
                        <>
                            <LoadingSpinner />
                            {t('stopping-status')}
                        </>
                    ) : (
                        <>{t('yes-stop-search-job')}</>
                    )}
                </Button>
            </footer>
        </Modal>
    )
}
