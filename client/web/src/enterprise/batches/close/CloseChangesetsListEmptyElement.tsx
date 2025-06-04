import React from 'react'

import { useTranslation } from 'react-i18next'

import { Text } from '@sourcegraph/wildcard'

import styles from './CloseChangesetsListEmptyElement.module.scss'

export const CloseChangesetsListEmptyElement: React.FunctionComponent<React.PropsWithChildren<{}>> = () => {
    const { t } = useTranslation('enterprise/batches/close')

    return (
        <div className={styles.closeChangesetsListEmptyElementBody}>
            <Text alignment="center" weight="regular" className="text-muted">
                {t('closing-batch-change-not-alter-changesets')}
            </Text>
        </div>
    )
}
