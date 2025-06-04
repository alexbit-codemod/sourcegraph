import React, { useCallback } from 'react'

import { useTranslation } from 'react-i18next'

import { useMutation } from '@sourcegraph/http-client'
import { Button, Modal, Text, ErrorAlert, H3, AnchorLink, Alert } from '@sourcegraph/wildcard'

import type { DeleteGitHubAppResult, DeleteGitHubAppVariables, GitHubAppByIDFields } from '../../graphql-operations'
import { LoaderButton } from '../LoaderButton'

import { DELETE_GITHUB_APP_BY_ID_QUERY } from './backend'

export interface RemoveGitHubAppModalProps {
    app: Pick<GitHubAppByIDFields, 'id' | 'name' | 'appURL'>
    onCancel: () => void
    afterDelete: () => void
}

export const RemoveGitHubAppModal: React.FunctionComponent<React.PropsWithChildren<RemoveGitHubAppModalProps>> = ({
    app,
    onCancel,
    afterDelete,
}) => {
    const { t } = useTranslation('components/gitHubApps')

    const labelId = 'removeGitHubApp'
    const [deleteGitHubApp, { loading, error }] = useMutation<DeleteGitHubAppResult, DeleteGitHubAppVariables>(
        DELETE_GITHUB_APP_BY_ID_QUERY
    )

    const onDelete = useCallback<React.MouseEventHandler>(async () => {
        await deleteGitHubApp({ variables: { gitHubApp: app.id } })
        afterDelete()
    }, [afterDelete, app.id, deleteGitHubApp])

    return (
        <Modal onDismiss={onCancel} aria-labelledby={labelId}>
            <H3 className="mb-3">
                {t('remove-github-app-intro')}
                {app.name}"?
            </H3>
            {error && <ErrorAlert error={error} />}
            <Alert variant="warning">{t('remove-github-app-warning')}</Alert>
            <Text>{t('remove-github-app-complete-instructions')}</Text>
            <ul>
                <li>{t('uninstall-app-instructions')}</li>
                <li>
                    {/* TODO: We could route this directly to the Advanced settings page once we can distinguish organization apps from user apps. */}
                    {t('delete-app-instructions')}
                </li>
            </ul>

            <Text>
                <AnchorLink to={app.appURL} target="_blank" rel="noopener noreferrer">
                    {t('view-app-on-github')}
                </AnchorLink>
                {t('uninstall-or-delete-app-warning')}
            </Text>
            <div className="d-flex justify-content-end pt-1">
                <Button disabled={loading} className="mr-2" onClick={onCancel} outline={true} variant="secondary">
                    {t('cancel-action')}
                </Button>
                <LoaderButton
                    disabled={loading}
                    onClick={onDelete}
                    variant="danger"
                    loading={loading}
                    alwaysShowLabel={true}
                    label={t('remove-github-app-title')}
                />
            </div>
        </Modal>
    )
}
