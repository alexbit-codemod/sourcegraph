import React, { type ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { Checkbox, RadioButton, Select, TextArea, Input } from '../../../components'

import '@storybook/addon-designs'

import styles from './FormFieldVariants.module.scss'

type FieldVariants = 'standard' | 'invalid' | 'valid' | 'disabled' | 'error'

type InputStatus = 'initial' | 'error' | 'loading' | 'valid'

interface WithVariantsProps {
    field: React.ComponentType<
        React.PropsWithChildren<{
            className?: string
            disabled?: boolean
            message?: ReactNode
            variant: FieldVariants
            status?: InputStatus
        }>
    >
}

const FieldMessageText = 'Helper text'

const FieldMessage: React.FunctionComponent<React.PropsWithChildren<{ className?: string }>> = ({ className }) => (
    <small className={className}>{FieldMessageText}</small>
)

// Use this temporarily for form components which ones we haven't implemented in wilcard package yet
const WithVariantsAndMessageElements: React.FunctionComponent<React.PropsWithChildren<WithVariantsProps>> = ({
    field: Field,
}) => (
    <>
        <Field variant="standard" message={<FieldMessage className="field-message" />} />
        <Field
            status="error"
            variant="error"
            className="is-invalid"
            message={<FieldMessage className="invalid-feedback" />}
        />
        <Field
            status="valid"
            variant="valid"
            className="is-valid"
            message={<FieldMessage className="valid-feedback" />}
        />
        <Field variant="disabled" disabled={true} message={<FieldMessage className="field-message" />} />
    </>
)

const WithVariants: React.FunctionComponent<React.PropsWithChildren<WithVariantsProps>> = ({ field: Field }) => (
    <>
        <Field variant="standard" message={FieldMessageText} />
        <Field variant="invalid" message={FieldMessageText} />
        <Field variant="valid" message={FieldMessageText} />
        <Field variant="disabled" message={FieldMessageText} />
    </>
)

export const FormFieldVariants: React.FunctionComponent<React.PropsWithChildren<unknown>> = () => (
    <div className={styles.grid}>
        <WithVariantsAndMessageElements
            field={({ className, variant, message, ...props }) => {
                const { t } = useTranslation('../../wildcard/src/global-styles/GlobalStylesStory/FormFieldVariants')

                return (
                    <fieldset className="form-group">
                        <Input placeholder={t('form-field')} className={className} {...props} />
                        {message}
                    </fieldset>
                )
            }}
        />
        <WithVariants
            field={({ className, message, variant, ...props }) => {
                const { t } = useTranslation('../../wildcard/src/global-styles/GlobalStylesStory/FormFieldVariants')

                return (
                    <Select
                        isCustomStyle={true}
                        className={className}
                        isValid={variant === 'invalid' ? false : variant === 'valid' ? true : undefined}
                        message={message}
                        disabled={variant === 'disabled'}
                        aria-label=""
                        {...props}
                    >
                        <option>{t('option-a')}</option>
                        <option>{t('option-b')}</option>
                        <option>{t('option-c')}</option>
                    </Select>
                )
            }}
        />
        <WithVariants
            field={({ className, message, variant, ...props }) => {
                const { t } = useTranslation('../../wildcard/src/global-styles/GlobalStylesStory/FormFieldVariants')

                return (
                    <fieldset className="form-group">
                        <TextArea
                            message={message}
                            placeholder={t('sample-content-text-area')}
                            className={className}
                            rows={4}
                            isValid={variant === 'invalid' ? false : variant === 'valid' ? true : undefined}
                            disabled={variant === 'disabled'}
                            {...props}
                        />
                    </fieldset>
                )
            }}
        />
        <WithVariants
            field={({ className, message, variant, ...props }) => {
                const { t } = useTranslation('../../wildcard/src/global-styles/GlobalStylesStory/FormFieldVariants')

                return (
                    <Checkbox
                        id={`inputFieldsetCheck - ${variant}`}
                        label={t('checkbox')}
                        className={className}
                        name={`inputFieldsetCheck - ${variant}`}
                        isValid={variant === 'invalid' ? false : variant === 'valid' ? true : undefined}
                        message={message}
                        disabled={variant === 'disabled'}
                        {...props}
                    />
                )
            }}
        />
        <WithVariants
            field={({ className, message, variant, ...props }) => {
                const { t } = useTranslation('../../wildcard/src/global-styles/GlobalStylesStory/FormFieldVariants')

                return (
                    <RadioButton
                        id={`inputFieldsetRadio - ${variant}`}
                        className={className}
                        name={`inputFieldsetRadio - ${variant}`}
                        label={t('radio-button')}
                        isValid={variant === 'invalid' ? false : variant === 'valid' ? true : undefined}
                        message={message}
                        disabled={variant === 'disabled'}
                        {...props}
                    />
                )
            }}
        />
    </div>
)
