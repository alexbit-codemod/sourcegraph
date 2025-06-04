import type { FC } from 'react'

import classNames from 'classnames'
import { timeFormat } from 'd3-time-format'
import { useTranslation } from 'react-i18next'

import { SyntaxHighlightedSearchQuery } from '@sourcegraph/branded/src'
import { UserAvatar } from '@sourcegraph/shared/src/components/UserAvatar'

import type { SearchJobNode } from '../../../graphql-operations'
import { SearchJobBadge } from '../SearchJobBadge/SearchJobBadge'

import styles from './SearchJobCard.module.scss'

const formatDate = timeFormat('%Y-%m-%d %H:%M:%S')

interface SearchJobCardProps {
    searchJob: SearchJobNode
    className?: string
}

export const SearchJobCard: FC<SearchJobCardProps> = props => {
    const { t } = useTranslation('enterprise/search-jobs/SearchJobCard')

    const { searchJob, className } = props

    return (
        <table className={classNames(className, styles.card)}>
            <tr className={styles.row}>
                <td className={styles.label}>{t('status')}</td>
                <td>
                    <SearchJobBadge job={searchJob} withProgress={false} />
                </td>
            </tr>
            <tr className={styles.row}>
                <td className={styles.label}>{t('started-at')}</td>
                <td>{searchJob.startedAt ? formatDate(new Date(searchJob.startedAt)) : '—'}</td>
            </tr>
            <tr className={styles.row}>
                <td className={styles.label}>{t('query')}</td>
                <td>
                    <SyntaxHighlightedSearchQuery query={searchJob.query} />
                </td>
            </tr>
            <tr className={styles.row}>
                <td className={styles.label}>{t('author')}</td>
                <td className={styles.creator}>
                    <UserAvatar user={searchJob.creator!} className={styles.avatar} />
                    {searchJob.creator?.displayName ?? searchJob.creator?.username}
                </td>
            </tr>
        </table>
    )
}
