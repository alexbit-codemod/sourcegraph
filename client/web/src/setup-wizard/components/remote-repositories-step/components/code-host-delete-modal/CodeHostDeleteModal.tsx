import type { FC } from 'react'

import { useApolloClient } from '@apollo/client'
import type { ApolloCache } from '@apollo/client/cache'
import { useTranslation, Trans } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { pluralize } from '@sourcegraph/common'
import { useMutation } from '@sourcegraph/http-client'
import type { ExternalServiceKind } from '@sourcegraph/shared/src/graphql-operations'
import { Button, ErrorAlert, H2, Modal, Text } from '@sourcegraph/wildcard'

import { LoaderButton } from '../../../../../components/LoaderButton'
import { CodeHostIcon } from '../../helpers'
import { DELETE_CODE_HOST } from '../../queries'

import styles from './CodeHostDeleteModal.module.scss'

export interface CodeHostToDelete {
    id: string
    kind: ExternalServiceKind
    displayName: string
    repoCount?: number
}

interface CodeHostDeleteModalProps {
    codeHost: CodeHostToDelete
    onDismiss: () => void
}

export const CodeHostDeleteModal: FC<CodeHostDeleteModalProps> = props => {
    const { t } = useTranslation('setup-wizard/components/remote-repositories-step/components/code-host-delete-modal')

    const { codeHost, onDismiss } = props

    const navigate = useNavigate()
    const apolloClient = useApolloClient()
    const [deleteCode, { loading, error }] = useMutation(DELETE_CODE_HOST)

    const handleDeleteConfirm = async (): Promise<void> => {
        await deleteCode({
            variables: { id: codeHost.id },
            refetchQueries: ['StatusAndRepoStats'],
        })
        navigate('/setup/remote-repositories')

        // We have to remove it from the cache after we remove it on the backend
        // and navigate user away from the edit UI (in case if this modal is used from
        // edit UI) otherwise clearing the cache will trigger query in edit UI for code host
        // which doesn't exist anymore
        removeDeletedHostFromCache(apolloClient.cache, codeHost.id)
        onDismiss()
    }

    return (
        <Modal
            position="center"
            aria-label="Delete external code host connection"
            className={styles.root}
            onDismiss={onDismiss}
        >
            <H2>
                {t('remove-connection-with')}
                <CodeHostIcon codeHostType={codeHost.kind} aria-hidden={true} /> '{codeHost.displayName}'?
            </H2>

            <hr className={styles.seperator} />

            <Text>
                {t('there')}
                {pluralize('is', codeHost.repoCount ?? 0, 'are')}
                <Trans
                    i18nKey="repo-count-and-pluralize"
                    values={{ codeHostRepoCount0: codeHost.repoCount ?? 0 }}
                    components={{ '0': <b /> }}
                />
                {codeHost.displayName}
                {t('connection-removed-warning')}
            </Text>

            <hr className={styles.seperator} />

            {error && <ErrorAlert error={error} />}

            <div className={styles.footer}>
                <LoaderButton
                    variant="danger"
                    label={t('yes-remove-connection')}
                    loading={loading}
                    disabled={loading}
                    alwaysShowLabel={true}
                    onClick={handleDeleteConfirm}
                />
                <Button variant="secondary" onClick={onDismiss}>
                    {t('cancel')}
                </Button>
            </div>
        </Modal>
    )
}

function removeDeletedHostFromCache(cache: ApolloCache<any>, codeHostId: string): void {
    const deletedCodeHostId = cache.identify({
        __typename: 'ExternalService',
        id: codeHostId,
    })

    // Remove deleted code host from the apollo cache
    cache.evict({ id: deletedCodeHostId })
}
