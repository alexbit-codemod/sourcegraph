import React from 'react'

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { Button } from '@sourcegraph/wildcard'

import styles from './ShowMoreButton.module.scss'

interface ShowMoreProps {
    className?: string
    compact?: boolean
    centered?: boolean
    onClick: () => void
}

/**
 * FilteredConnection styled Button to support fetching more results
 */
export const ShowMoreButton: React.FunctionComponent<React.PropsWithChildren<ShowMoreProps>> = ({
    className,
    compact,
    centered,
    onClick,
}) => {
    const { t } = useTranslation('components/FilteredConnection/ui')

    return (
        <Button
            className={classNames(styles.normal, !compact && styles.noncompact, centered && styles.centered, className)}
            onClick={onClick}
            size="sm"
            variant="link"
        >
            {t('show-more')}
        </Button>
    )
}
