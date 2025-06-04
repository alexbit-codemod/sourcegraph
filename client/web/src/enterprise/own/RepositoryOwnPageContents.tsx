import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Timestamp } from '@sourcegraph/branded/src/components/Timestamp'
import { useQuery } from '@sourcegraph/http-client'
import { H3, Text, Code, Card, LoadingSpinner, ErrorAlert } from '@sourcegraph/wildcard'

import type {
    GetIngestedCodeownersResult,
    GetIngestedCodeownersVariables,
    IngestedCodeowners,
    RepositoryFields,
} from '../../graphql-operations'

import { DeleteFileButton } from './DeleteFileButton'
import { GET_INGESTED_CODEOWNERS_QUERY } from './graphqlQueries'
import { IngestedFileViewer } from './IngestedFileViewer'
import type { RepositoryOwnAreaPageProps } from './RepositoryOwnEditPage'
import { UploadFileButton } from './UploadFileButton'

import styles from './RepositoryOwnPageContents.module.scss'

export interface CodeownersIngestedFile {
    contents: string
    updatedAt: string
}

export const RepositoryOwnPageContents: React.FunctionComponent<
    Pick<RepositoryOwnAreaPageProps, 'repo' | 'authenticatedUser' | 'telemetryRecorder'>
> = ({ repo, authenticatedUser, telemetryRecorder }) => {
    const { t } = useTranslation('enterprise/own')

    const isAdmin = authenticatedUser?.siteAdmin

    const { data, error, loading } = useQuery<GetIngestedCodeownersResult, GetIngestedCodeownersVariables>(
        GET_INGESTED_CODEOWNERS_QUERY,
        {
            variables: {
                repoID: repo.id,
            },
        }
    )

    const [codeownersIngestedFile, setCodeownersIngestedFile] = useState<IngestedCodeowners | null>(null)
    useEffect(() => {
        if (data?.node?.__typename === 'Repository') {
            if (data.node.ingestedCodeowners?.__typename === 'CodeownersIngestedFile') {
                setCodeownersIngestedFile(data.node.ingestedCodeowners)
            } else {
                setCodeownersIngestedFile(null)
            }
        }
    }, [data?.node])

    if (loading) {
        return (
            <div className="container d-flex justify-content-center mt-3">
                <LoadingSpinner />
                {t('loading-message')}
            </div>
        )
    }

    if (error) {
        return <ErrorAlert className="mt-3" error={error} prefix="Error loading ownership info for this repository" />
    }

    return (
        <>
            <Card className={styles.columns}>
                <div>
                    <H3>{isAdmin ? 'Upload a CODEOWNERS file' : 'Ask your site admin to upload a CODEOWNERS file'}</H3>
                    <Text>
                        {t('admin-upload-codeowners-info', {
                            isAdminASiteAdminCanManuallyUploadACodeownersFileForThisRepository:
                                !isAdmin && 'A site admin can manually upload a CODEOWNERS file for this repository. ',
                        })}
                    </Text>

                    {isAdmin && (
                        <UploadFileButton
                            repo={repo}
                            onComplete={file => {
                                setCodeownersIngestedFile(file)
                                telemetryRecorder.recordEvent('repo.ownership.edit.file', 'upload')
                            }}
                            fileAlreadyExists={!!codeownersIngestedFile}
                        />
                    )}
                </div>

                <div className={styles.or}>
                    <div className={styles.orLine} />
                    <div className="py-2">{t('or-word')}</div>
                    <div className={styles.orLine} />
                </div>

                <div>
                    <H3>{t('commit-codeowners-file')}</H3>
                    <Text>
                        {t('add-a-codeowners-file')}
                        <Code>{t('codeowners-file')}</Code>
                        {t('owners-username-email')}
                        {getCodeHostName(repo)}
                        {t('usernames-email-addresses')}
                    </Text>
                    {codeownersIngestedFile && (
                        <Text className={styles.commitWarning}>
                            <em>{t('ignored-codeowners-file-warning')}</em>
                        </Text>
                    )}
                </div>
            </Card>

            {codeownersIngestedFile && (
                <div className="mt-5">
                    <H3>{t('uploaded-codeowners-file')}</H3>
                    <div className="d-flex align-items-baseline justify-content-between">
                        <Text>
                            {t('uploaded-codeowners-file-info')}
                            <Timestamp date={codeownersIngestedFile.updatedAt} />.
                        </Text>
                        {isAdmin && (
                            <DeleteFileButton
                                repo={repo}
                                onComplete={() => {
                                    setCodeownersIngestedFile(null)
                                    telemetryRecorder.recordEvent('repo.ownership.edit.file', 'delete')
                                }}
                            />
                        )}
                    </div>
                    <IngestedFileViewer contents={codeownersIngestedFile.contents} />
                </div>
            )}
        </>
    )
}

const getCodeHostName = (repo: RepositoryFields): string => {
    const externalServiceKind = repo.externalURLs[0]?.serviceKind

    switch (externalServiceKind) {
        case 'GITHUB': {
            return 'GitHub'
        }
        case 'GITLAB': {
            return 'GitLab'
        }
        default: {
            return 'code host'
        }
    }
}
