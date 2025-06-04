import type { FC } from 'react'

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { Badge, Tooltip, Code } from '@sourcegraph/wildcard'

import styles from './DynamicFilterBadge.module.scss'

export const DynamicFilterBadge: FC<{ exhaustive: boolean; count: number }> = ({ exhaustive, count }) => {
    const { t } = useTranslation('../../branded/src/search-ui/results/filters/components')

    const tooltipContent = exhaustive ? null : (
        <>
            {t('approximate-count-limit-warning')}
            <Code>{t('count-label')}</Code>
            {t('filter-instructions')}
            <Code>{t('count-all-filter')}</Code>
            {t('filter-list-instructions')}
        </>
    )

    return (
        <Tooltip content={tooltipContent} placement="right">
            <Badge ref={null} variant="secondary" className={classNames('ml-2', styles.countBadge)}>
                {exhaustive ? count : `${roundCount(count)}+`}
            </Badge>
        </Tooltip>
    )
}

function roundCount(count: number): number {
    const roundNumbers = [10000, 5000, 1000, 500, 100, 50, 10, 5, 1]
    for (const roundNumber of roundNumbers) {
        if (count >= roundNumber) {
            return roundNumber
        }
    }
    return 0
}
