import React from 'react'

import { useTranslation } from 'react-i18next'

import { Button, FeedbackText, H4 } from '@sourcegraph/wildcard'

import { Toast } from './Toast'

import styles from './SurveySuccessToast.module.scss'

interface SurveySuccessToastProps {
    onDismiss: () => void
}

export const SurveySuccessToast: React.FunctionComponent<SurveySuccessToastProps> = ({ onDismiss }) => {
    const { t } = useTranslation('marketing/toast')

    return (
        <Toast
            subtitle={<H4 className={styles.toastSubtitle}>{t('thank-you-feedback')}</H4>}
            cta={<FeedbackText headerText={t('anything-else-question')} />}
            footer={
                <div className="d-flex justify-content-end">
                    <Button variant="primary" size="sm" onClick={onDismiss}>
                        {t('done-message')}
                    </Button>
                </div>
            }
            className="text-center"
            onDismiss={onDismiss}
        />
    )
}
