import * as React from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { numberWithCommas } from '@sourcegraph/common'
import { Link } from '@sourcegraph/wildcard'

import { SingleValueCard } from '../../components/SingleValueCard'
import type { ProductLicenseInfoResult } from '../../graphql-operations'
import { formatUserCount } from '../../productSubscription/helpers'

import styles from './TrueUpStatusSummary.module.scss'

interface Props {
    /**
     * The max number of user accounts that have been active on this Sourcegraph
     * site for the current license. If no license is in use, returns zero.
     */
    actualUserCount: number
    /**
     * The date and time when the max number of user accounts that have been
     * active on this Sourcegraph site for the current license was reached. If
     * no license is in use, returns an empty string.
     */
    actualUserCountDate: string
    license: NonNullable<ProductLicenseInfoResult['site']['productSubscription']['license']>
}
/**
 * Displays a summary of the site's true-up pricing status.
 */
export const TrueUpStatusSummary: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    actualUserCount,
    actualUserCountDate,
    license,
}) => {
    const { t } = useTranslation('enterprise/productSubscription')

    return (
        <div className="mb-2">
            <div className={styles.container}>
                <SingleValueCard
                    className={styles.item}
                    value={numberWithCommas(license.userCount)}
                    valueTooltip={t('formatted-user-count-license', {
                        formatUserCountLicenseUserCountTrue: formatUserCount(license.userCount, true),
                    })}
                    title={t('licensed-users-label')}
                    subText={t('licensed-users-description')}
                />
                <SingleValueCard
                    className={styles.item}
                    value={numberWithCommas(actualUserCount)}
                    valueTooltip={t('total-users-count', {
                        numberWithCommasActualUserCount: numberWithCommas(actualUserCount),
                        actualUserCountDateReachedOnActualUserCountDate:
                            actualUserCountDate && ` (reached on ${actualUserCountDate})`,
                    })}
                    title={t('maximum-users-label')}
                    subText={t('maximum-users-description')}
                />
                <SingleValueCard
                    className={styles.item}
                    value={numberWithCommas(Math.max(0, actualUserCount - license.userCount))}
                    valueTooltip={t('users-over-license-count', {
                        numberWithCommasMathMax0ActualUserCountLicenseUserCount: numberWithCommas(
                            Math.max(0, actualUserCount - license.userCount)
                        ),
                        actualUserCountDateOnActualUserCountDate: actualUserCountDate && ` (on ${actualUserCountDate})`,
                    })}
                    title={t('users-over-license-label')}
                    subText={t('users-over-license-description')}
                    valueClassName={license.userCount - actualUserCount < 0 ? 'text-danger' : ''}
                />
            </div>
            <small>
                <Trans
                    i18nKey="learn-more-true-up-pricing"
                    components={{
                        '0': <Link to="https://sourcegraph.com/pricing" target="_blank" rel="noopener noreferrer" />,
                    }}
                />
            </small>
        </div>
    )
}
