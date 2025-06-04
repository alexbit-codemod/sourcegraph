import React from 'react'

import { mdiPulse } from '@mdi/js'
import { useTranslation, Trans } from 'react-i18next'

import { Text, H3, Container, Icon, LoadingSpinner, ErrorAlert, Link, Code } from '@sourcegraph/wildcard'

import { useBatchChangesRolloutWindowConfig } from '../backend'

import { formatRate, formatDays } from './format'

import styles from './RolloutWindowsConfiguration.module.scss'

// Displays the rollout window configuration.
export const RolloutWindowsConfiguration: React.FunctionComponent = () => {
    const { t } = useTranslation('enterprise/batches/settings')

    const { loading, error, rolloutWindowConfig } = useBatchChangesRolloutWindowConfig()
    return (
        <Container className="mb-3">
            <H3>{t('rollout-windows-title')}</H3>
            {loading && <LoadingSpinner />}
            {error && <ErrorAlert error={error} />}
            {!loading &&
                rolloutWindowConfig &&
                (rolloutWindowConfig.length === 0 ? (
                    <Text className="mb-0">
                        <Trans
                            i18nKey="no-rollout-windows-configured"
                            components={{
                                '0': <Link to="/help/admin/config/batch_changes#rollout-windows" target="_blank" />,
                            }}
                        />
                    </Text>
                ) : (
                    <>
                        <Text>
                            {t('configuring-rollout-windows-explanation')}
                            <Code>batchChanges.rolloutWindows</Code>{' '}
                            <Link to="/help/admin/config/batch_changes#rollout-windows">
                                site configuration option.
                            </Link>
                        </Text>
                        <ul className={styles.rolloutWindowList}>
                            {rolloutWindowConfig.map((rolloutWindow, index) => {
                                const { t } = useTranslation('enterprise/batches/settings')

                                return (
                                    <li key={index} className={styles.rolloutWindowListItem}>
                                        <Text className={styles.rolloutWindowListItemFrequency}>
                                            <Icon
                                                className={styles.rolloutWindowListItemFrequencyIcon}
                                                svgPath={mdiPulse}
                                                aria-label="Rollout window frequency"
                                            />
                                            {formatRate(rolloutWindow.rate)}
                                        </Text>
                                        <small>
                                            {t('on-format-days', {
                                                formatDaysRolloutWindowDays: formatDays(rolloutWindow.days),
                                            })}
                                        </small>
                                        <br />
                                        {rolloutWindow.start && rolloutWindow.end && (
                                            <small>
                                                {rolloutWindow.start} - {rolloutWindow.end}
                                                {t('utc-time-indicator')}
                                            </small>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    </>
                ))}
        </Container>
    )
}
