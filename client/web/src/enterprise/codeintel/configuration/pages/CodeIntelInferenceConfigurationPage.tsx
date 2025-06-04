import { type FunctionComponent, useState, useEffect } from 'react'

import { useTranslation, Trans } from 'react-i18next'

import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { ErrorAlert, Link, LoadingSpinner, PageHeader } from '@sourcegraph/wildcard'

import type { AuthenticatedUser } from '../../../../auth'
import { PageTitle } from '../../../../components/PageTitle'
import { InferenceScriptEditor } from '../components/inference-script/InferenceScriptEditor'
import { InferenceScriptPreview } from '../components/inference-script/InferenceScriptPreview'
import { useInferenceScript } from '../hooks/useInferenceScript'

import styles from './CodeIntelInferenceConfigurationPage.module.scss'

export interface CodeIntelInferenceConfigurationPageProps extends TelemetryProps, TelemetryV2Props {
    authenticatedUser: AuthenticatedUser | null
}

export const CodeIntelInferenceConfigurationPage: FunctionComponent<CodeIntelInferenceConfigurationPageProps> = ({
    authenticatedUser,
    ...props
}) => {
    const { t } = useTranslation('enterprise/codeintel/configuration/pages')

    const { inferenceScript, loadingScript, fetchError } = useInferenceScript()
    const [previewScript, setPreviewScript] = useState<string | null>(null)
    const inferencePreview = previewScript !== null ? previewScript : inferenceScript

    useEffect(() => {
        props.telemetryRecorder.recordEvent('admin.codeIntel.inferenceConfiguration', 'view')
    }, [props.telemetryRecorder])

    return (
        <>
            <PageTitle title={t('code-graph-inference-script-title')} />
            <PageHeader
                headingElement="h2"
                path={[
                    {
                        text: <>{t('code-graph-inference-script-description')}</>,
                    },
                ]}
                description={
                    <>
                        <Trans
                            i18nKey="lua-script-auto-indexing-reference"
                            components={{ '0': <Link to="/help/code_navigation/references/inference_configuration" /> }}
                        />
                        <ul className={styles.list}>
                            {['Clang', 'Go', 'Java', 'Python', 'Ruby', 'Rust', 'TypeScript'].map(lang => (
                                <li key={lang.toLowerCase()}>
                                    <Link
                                        to={`https://sourcegraph.com/github.com/sourcegraph/sourcegraph@5.0/-/blob/enterprise/internal/codeintel/autoindexing/internal/inference/lua/${lang.toLowerCase()}.lua`}
                                    >
                                        {lang}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                }
                className="mb-3"
            />
            {fetchError && <ErrorAlert prefix="Error fetching inference script" error={fetchError} />}
            {loadingScript && <LoadingSpinner />}

            <InferenceScriptEditor
                script={inferenceScript}
                authenticatedUser={authenticatedUser}
                setPreviewScript={setPreviewScript}
                {...props}
            />

            <InferenceScriptPreview script={inferencePreview} />
        </>
    )
}
