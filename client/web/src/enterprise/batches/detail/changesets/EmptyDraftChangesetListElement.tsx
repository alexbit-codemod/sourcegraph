import React from 'react'

import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { Link, H3, Text } from '@sourcegraph/wildcard'

import styles from './EmptyDraftChangesetListElement.module.scss'

export const EmptyDraftChangesetListElement: React.FunctionComponent<React.PropsWithChildren<{}>> = () => {
    const { t } = useTranslation('enterprise/batches/detail/changesets')

    const location = useLocation()
    return (
        <div className={styles.emptyDraftChangesetListElementBody}>
            <H3>{t('no-changesets-exist')}</H3>
            <div className={styles.emptyDraftChangesetListElementContent}>
                <Text className="mt-2">{t('draft-batch-change-explanation')}</Text>
                <Link to={`${location.pathname}/edit`}>{t('edit-recent-spec')}</Link>
            </div>
        </div>
    )
}
