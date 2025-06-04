import type { FunctionComponent } from 'react'

import { useTranslation } from 'react-i18next'

import {
    Button,
    Input,
    H3,
    ErrorAlert,
    useForm,
    useField,
    FORM_ERROR,
    getDefaultInputProps,
    createRequiredValidator,
    type SubmissionResult,
} from '@sourcegraph/wildcard'

import { LoaderButton } from '../../../../../../../../components/LoaderButton'

export interface DrillDownInsightCreationFormValues {
    insightName: string
}

const INSIGHT_NAME_VALIDATORS = createRequiredValidator('Insight name is a required field.')

const DEFAULT_FORM_VALUES: DrillDownInsightCreationFormValues = {
    insightName: '',
}

interface DrillDownInsightCreationFormProps {
    className?: string
    onCreateInsight: (values: DrillDownInsightCreationFormValues) => SubmissionResult
    onCancel: () => void
}

export const DrillDownInsightCreationForm: FunctionComponent<DrillDownInsightCreationFormProps> = props => {
    const { t } = useTranslation(
        'enterprise/insights/components/insights-view-grid/components/backend-insight/components/drill-down-filters-panel'
    )

    const { className, onCreateInsight, onCancel } = props

    const { formAPI, ref, handleSubmit } = useForm({
        initialValues: DEFAULT_FORM_VALUES,
        onSubmit: onCreateInsight,
    })

    const insightName = useField({
        name: 'insightName',
        formApi: formAPI,
        validators: { sync: INSIGHT_NAME_VALIDATORS },
    })

    return (
        // eslint-disable-next-line react/forbid-elements
        <form ref={ref} onSubmit={handleSubmit} noValidate={true} className={className}>
            <H3 className="mb-3">{t('save-as-new-view')}</H3>

            <Input
                label={t('name-label')}
                autoFocus={true}
                required={true}
                message="Shown as the title for your insight"
                placeholder={t('example-migration-to-react')}
                {...getDefaultInputProps(insightName)}
            />

            <footer className="mt-4 d-flex flex-wrap align-items-center">
                {formAPI.submitErrors?.[FORM_ERROR] && (
                    <ErrorAlert className="w-100 mb-3" error={formAPI.submitErrors[FORM_ERROR]} />
                )}

                <Button type="reset" variant="secondary" className="ml-auto mr-2" onClick={onCancel}>
                    {t('cancel-button')}
                </Button>

                <LoaderButton
                    type="submit"
                    alwaysShowLabel={true}
                    loading={formAPI.submitting}
                    label={formAPI.submitting ? 'Saving' : 'Save'}
                    disabled={formAPI.submitting}
                    data-testid="insight-save-button"
                    variant="primary"
                />
            </footer>
        </form>
    )
}
