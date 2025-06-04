import type { FC, FormEventHandler, FormHTMLAttributes, ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { Input, type useFieldAPI, getDefaultInputProps, type SubmissionErrors } from '@sourcegraph/wildcard'

import { CodeInsightDashboardsVisibility, RepositoryField } from '../../../../../../components'
import type { LangStatsCreationFormFields } from '../../types'

import styles from './LangStatsInsightCreationForm.module.scss'

export interface LangStatsInsightCreationFormProps
    extends Omit<FormHTMLAttributes<HTMLFormElement>, 'title' | 'children'> {
    handleSubmit: FormEventHandler
    submitErrors: SubmissionErrors
    submitting: boolean
    isFormClearActive: boolean
    dashboardReferenceCount?: number

    title: useFieldAPI<LangStatsCreationFormFields['title']>
    repository: useFieldAPI<LangStatsCreationFormFields['repository']>
    threshold: useFieldAPI<LangStatsCreationFormFields['threshold']>

    onFormReset: () => void
    children: (input: RenderPropertyInputs) => ReactNode
}

export interface RenderPropertyInputs {
    submitting: boolean
    submitErrors: SubmissionErrors
    isFormClearActive: boolean
}

export const LangStatsInsightCreationForm: FC<LangStatsInsightCreationFormProps> = props => {
    const { t } = useTranslation(
        'enterprise/insights/pages/insights/creation/lang-stats/components/lang-stats-insight-creation-form'
    )

    const {
        handleSubmit,
        submitErrors,
        submitting,
        title,
        repository,
        threshold,
        isFormClearActive,
        dashboardReferenceCount,
        onFormReset,
        children,
        ...attributes
    } = props

    return (
        // eslint-disable-next-line react/forbid-elements
        <form {...attributes} noValidate={true} onSubmit={handleSubmit} onReset={onFormReset}>
            {/*
                a11y-ignore
                Rule: aria-allowed-role ARIA - role should be appropriate for the element
                Error occurs as a result of using `role=combobox` on `textarea` element.
             */}
            <Input
                as={RepositoryField}
                required={true}
                autoFocus={true}
                label={t('repository-label')}
                message="This insight is limited to one repository. You can set up multiple language usage charts for analyzing other repositories."
                placeholder={t('example-repository-url')}
                {...getDefaultInputProps(repository)}
                className="mb-0"
                inputClassName="a11y-ignore"
            />

            <Input
                required={true}
                label={t('title-label')}
                message="Shown as the title for your insight."
                placeholder={t('example-title-format')}
                {...getDefaultInputProps(title)}
                className="mb-0 mt-4"
            />

            <Input
                required={true}
                min={1}
                max={100}
                type="number"
                label={t('threshold-other-category')}
                message="Languages with usage lower than the threshold are grouped into an 'other' category."
                {...getDefaultInputProps(threshold)}
                className="mb-0 mt-4"
                inputClassName={styles.formThresholdInput}
                inputSymbol={<span className={styles.formThresholdInputSymbol}>%</span>}
            />

            {!!dashboardReferenceCount && dashboardReferenceCount > 1 && (
                <CodeInsightDashboardsVisibility className="mt-5 mb-n1" dashboardCount={dashboardReferenceCount} />
            )}

            <hr aria-hidden={true} className={styles.formSeparator} />

            {children({ submitting, submitErrors, isFormClearActive })}
        </form>
    )
}
