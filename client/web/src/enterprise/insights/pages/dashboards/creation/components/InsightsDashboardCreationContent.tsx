import React, { type ReactNode } from 'react'

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import {
    Input,
    ErrorAlert,
    FormGroup,
    useForm,
    useField,
    getDefaultInputProps,
    createRequiredValidator,
    FORM_ERROR,
    type FormAPI,
    type SubmissionErrors,
} from '@sourcegraph/wildcard'

import { FormRadioInput, LimitedAccessLabel } from '../../../../components'
import { type InsightsDashboardOwner, isGlobalOwner, isOrganizationOwner, isPersonalOwner } from '../../../../core'
import { useUiFeatures } from '../../../../hooks'

import styles from './InsightsDashboardCreationContent.module.scss'

const DASHBOARD_TITLE_VALIDATORS = createRequiredValidator('Name is a required field.')

const DASHBOARD_INITIAL_VALUES: DashboardCreationFields = {
    name: '',
    owner: null,
}

export interface DashboardCreationFields {
    name: string
    owner: InsightsDashboardOwner | null
}

export interface InsightsDashboardCreationContentProps {
    initialValues?: DashboardCreationFields
    owners: InsightsDashboardOwner[]
    onSubmit: (values: DashboardCreationFields) => Promise<SubmissionErrors>
    children: (formAPI: FormAPI<DashboardCreationFields>) => ReactNode
}

/**
 * Renders creation UI form content (fields, submit and cancel buttons).
 */
export const InsightsDashboardCreationContent: React.FunctionComponent<
    InsightsDashboardCreationContentProps
> = props => {
    const { t } = useTranslation('enterprise/insights/pages/dashboards/creation/components')

    const { initialValues, owners, onSubmit, children } = props

    const { licensed } = useUiFeatures()

    const userOwner = owners.find(isPersonalOwner)
    const personalOwners = owners.filter(isPersonalOwner)
    const organizationOwners = owners.filter(isOrganizationOwner)
    const globalOwners = owners.filter(isGlobalOwner)

    const { ref, handleSubmit, formAPI } = useForm<DashboardCreationFields>({
        initialValues: initialValues ?? {
            ...DASHBOARD_INITIAL_VALUES,
            owner: userOwner ?? null,
        },
        onSubmit,
    })

    const name = useField({
        name: 'name',
        formApi: formAPI,
        validators: { sync: DASHBOARD_TITLE_VALIDATORS },
    })

    const visibility = useField({
        name: 'owner',
        formApi: formAPI,
    })

    return (
        // eslint-disable-next-line react/forbid-elements
        <form noValidate={true} ref={ref} onSubmit={handleSubmit}>
            <Input
                required={true}
                autoFocus={true}
                label={t('name-label')}
                placeholder={t('example-dashboard-description')}
                message="Shown as the title for your dashboard"
                {...getDefaultInputProps(name)}
            />

            <FormGroup name="visibility" title="Visibility" contentClassName="d-flex flex-column" className="mb-0 mt-4">
                {personalOwners.map(owner => {
                    const { t } = useTranslation('enterprise/insights/pages/dashboards/creation/components')

                    return (
                        <FormRadioInput
                            key={owner.id}
                            name="visibility"
                            value={owner.id}
                            title={t('private-label')}
                            description={t('visibility-private-message')}
                            checked={visibility.input.value?.id === owner.id}
                            className="mr-3"
                            onChange={() => visibility.input.onChange(owner)}
                        />
                    )
                })}

                <hr className="mt-2 mb-3" />

                <small className="d-block text-muted mb-3">{t('shared-visibility-message')}</small>

                {organizationOwners.map(org => (
                    <FormRadioInput
                        key={org.id}
                        name="visibility"
                        value={org.id}
                        title={org.title}
                        checked={visibility.input.value?.id === org.id}
                        onChange={() => visibility.input.onChange(org)}
                        className="mr-3"
                    />
                ))}

                {organizationOwners.length === 0 && (
                    <FormRadioInput
                        name="visibility"
                        value="organization"
                        disabled={true}
                        title={t('organization-label')}
                        description={t('organization-users-message')}
                        labelTooltipPosition="right"
                        className="d-inline-block mr-3"
                        labelTooltipText={t('create-join-organization-message')}
                    />
                )}

                {globalOwners.map(owner => {
                    const { t } = useTranslation('enterprise/insights/pages/dashboards/creation/components')

                    return (
                        <FormRadioInput
                            key={owner.id}
                            name="visibility"
                            value={owner.id}
                            title={owner.title}
                            description={t('visibility-public-message')}
                            checked={visibility.input.value?.id === owner.id}
                            className="mr-3 flex-grow-0"
                            onChange={() => visibility.input.onChange(owner)}
                        />
                    )
                })}
            </FormGroup>

            {formAPI.submitErrors?.[FORM_ERROR] && (
                <ErrorAlert error={formAPI.submitErrors[FORM_ERROR]} className="mt-2 mb-2" />
            )}

            {!licensed && (
                <LimitedAccessLabel
                    className={classNames(styles.limitedBanner)}
                    message="Unlock Code Insights to create unlimited custom dashboards"
                />
            )}

            <div className="d-flex flex-wrap justify-content-end mt-3">{children(formAPI)}</div>
        </form>
    )
}
