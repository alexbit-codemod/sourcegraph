import React, { useEffect } from 'react'

import { useTranslation } from 'react-i18next'

import { useLazyQuery } from '@sourcegraph/http-client'
import {
    LoadingSpinner,
    ErrorAlert,
    Input,
    Button,
    getDefaultInputProps,
    useField,
    useForm,
    Form,
    Label,
    Text,
} from '@sourcegraph/wildcard'

import { LogOutput } from '../../../../../components/LogOutput'
import type {
    GetRepoIdResult,
    GetRepoIdVariables,
    InferAutoIndexJobsForRepoResult,
    InferAutoIndexJobsForRepoVariables,
} from '../../../../../graphql-operations'
import { RepositoryField } from '../../../../insights/components'
import { GET_REPO_ID, INFER_JOBS_SCRIPT } from '../../backend'
import { autoIndexJobsToFormData } from '../inference-form/auto-index-to-form-job'
import { InferenceForm } from '../inference-form/InferenceForm'

import styles from './InferenceScriptPreview.module.scss'

interface InferenceScriptPreviewFormValues {
    repository: string
}

interface InferenceScriptPreviewProps {
    script: string
}

export const InferenceScriptPreview: React.FunctionComponent<InferenceScriptPreviewProps> = ({ script }) => {
    const { t } = useTranslation('enterprise/codeintel/configuration/components/inference-script')

    const [getRepoId, repoData] = useLazyQuery<GetRepoIdResult, GetRepoIdVariables>(GET_REPO_ID, {})
    const [inferJobs, { data, loading, error }] = useLazyQuery<
        InferAutoIndexJobsForRepoResult,
        InferAutoIndexJobsForRepoVariables
    >(INFER_JOBS_SCRIPT, {})

    const form = useForm<InferenceScriptPreviewFormValues>({
        initialValues: { repository: '' },
        onSubmit: async ({ repository }) => getRepoId({ variables: { name: repository } }),
    })

    useEffect(() => {
        const id = repoData?.data?.repository?.id

        if (id) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            inferJobs({ variables: { repository: id, script, rev: null }, fetchPolicy: 'cache-first' })
        }
    }, [inferJobs, repoData, script])

    const repository = useField({
        name: 'repository',
        formApi: form.formAPI,
    })

    return (
        <div>
            <Form className={styles.actionContainer} ref={form.ref} noValidate={true} onSubmit={form.handleSubmit}>
                <Label id="preview-label">{t('run-script-against-repository')}</Label>
                <div className="d-flex align-items-center">
                    <Input
                        as={RepositoryField}
                        required={true}
                        aria-label="Repository"
                        placeholder={t('example-github-url')}
                        {...getDefaultInputProps(repository)}
                        className={styles.actionInput}
                    />

                    <Button variant="success" type="submit">
                        {t('preview-results')}
                    </Button>
                </div>
            </Form>
            {loading ? (
                <LoadingSpinner className="d-block mx-auto mt-3" />
            ) : error ? (
                <ErrorAlert error={error} />
            ) : data ? (
                <>
                    {data.inferAutoIndexJobsForRepo.inferenceOutput && (
                        <>
                            <Text weight="bold">{t('script-output')}</Text>
                            <LogOutput text={data.inferAutoIndexJobsForRepo.inferenceOutput} />
                        </>
                    )}

                    <InferenceForm
                        initialFormData={autoIndexJobsToFormData({ jobs: data.inferAutoIndexJobsForRepo.jobs })}
                        readOnly={true}
                    />
                </>
            ) : (
                <></>
            )}
        </div>
    )
}
