import type { FC } from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { useTemporarySetting } from '@sourcegraph/shared/src/settings/temporary/useTemporarySetting'
import { Button, Modal, Link, H1, Text } from '@sourcegraph/wildcard'

import { useUiFeatures } from '../hooks'

import { FourLineChart, LangStatsInsightChart, ThreeLineChart } from './components/MediaCharts'

import styles from './GaConfirmationModal.module.scss'

export const GaConfirmationModal: FC = () => {
    const [isGaAccepted, setGaAccepted] = useTemporarySetting('insights.freeGaExpiredAccepted', false)
    const { licensed } = useUiFeatures()

    const showConfirmationModal = !licensed && isGaAccepted === false

    if (!showConfirmationModal) {
        return null
    }

    const handleAccept = (): void => {
        setGaAccepted(true)
    }

    return (
        <Modal position="center" aria-label="Code Insights Ga information" containerClassName={styles.overlay}>
            <GaConfirmationModalContent onAccept={handleAccept} />
        </Modal>
    )
}

interface GaConfirmationModalContentProps {
    onAccept: () => void
}

/**
 * Renders Code Insights Ga modal content component.
 * Exported especially for storybook story component cause chromatic has a problem of rendering modals
 * on CI.
 */
export const GaConfirmationModalContent: FC<GaConfirmationModalContentProps> = props => {
    const { t } = useTranslation('enterprise/insights/modals')

    const { onAccept } = props

    return (
        <>
            <H1 className={styles.title}>{t('thank-you-code-insights')}</H1>

            <div className={styles.mediaHeroWrapper}>
                <div className={styles.mediaHeroContent}>
                    <ThreeLineChart className={styles.chart} />
                    <FourLineChart className={styles.chart} />
                    <LangStatsInsightChart className={styles.chart} />
                </div>
                <div className={styles.mediaHeroOverlay}>{t('trial-expired')}</div>
            </div>

            <div className={styles.textContent}>
                <Text>
                    <b>{t('limited-access-version')}</b>
                </Text>

                <Text>{t('contact-admin-upgrade-license')}</Text>

                <Text>
                    <Trans
                        i18nKey="learn-more-limited-access"
                        components={{ '0': <Link to="/help/code_insights/references/license" /> }}
                    />
                </Text>
            </div>

            <footer className={styles.actions}>
                <Button variant="primary" onClick={onAccept}>
                    {t('understood-go-ahead')}
                </Button>
            </footer>
        </>
    )
}
