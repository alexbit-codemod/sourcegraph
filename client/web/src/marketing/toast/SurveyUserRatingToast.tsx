import React from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { Button, Checkbox, Link, Text } from '@sourcegraph/wildcard'

import { SurveyRatingRadio } from '../components/SurveyRatingRadio'

import { Toast } from './Toast'

import styles from './SurveyUserRatingToast.module.scss'

export interface SurveyUserRatingToastProps extends TelemetryV2Props {
    score: number
    onChange: (score: number) => void
    toggleErrorMessage: boolean
    onContinue: () => void
    onDismiss: () => void
    setToggledPermanentlyDismiss: (value: boolean) => void
}

export const SurveyUserRatingToast: React.FunctionComponent<SurveyUserRatingToastProps> = ({
    score,
    onChange,
    toggleErrorMessage,
    onDismiss,
    onContinue,
    setToggledPermanentlyDismiss,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('marketing/toast')

    return (
        <Toast
            title={t('tell-us-what-you-think')}
            subtitle={<span id="survey-toast-scores">{t('recommend-sourcegraph')}</span>}
            cta={
                <>
                    <SurveyRatingRadio
                        ariaLabelledby="survey-toast-scores"
                        score={score}
                        onChange={onChange}
                        telemetryRecorder={telemetryRecorder}
                    />
                    {toggleErrorMessage && (
                        <div className={styles.alertDanger} role="alert">
                            {t('select-a-score-0-to-10')}
                        </div>
                    )}
                </>
            }
            footer={
                <>
                    <Text className="d-flex align-items-center justify-content-between mb-1">
                        <span>
                            <Trans
                                i18nKey="feedback-agreement-sourcegraph-privacy-policy"
                                components={{ '0': <Link to="https://sourcegraph.com/terms/privacy" /> }}
                            />
                        </span>
                    </Text>
                    <div className="d-flex align-items-center justify-content-between">
                        <Checkbox
                            id="survey-toast-refuse"
                            label={<span className={styles.checkboxLabel}>{t('dont-show-again')}</span>}
                            onChange={event => setToggledPermanentlyDismiss(event.target.checked)}
                        />
                        <Button variant="secondary" size="sm" onClick={onContinue}>
                            {t('continue')}
                        </Button>
                    </div>
                </>
            }
            onDismiss={onDismiss}
        />
    )
}
