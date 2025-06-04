import type { FC } from 'react'

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { Icon, Link, H4 } from '@sourcegraph/wildcard'

import { LinkShareIcon, OpenBookIcon } from '../Icons'

import styles from './FiltersDocFooter.module.scss'

interface FiltersDocFooterProps {
    className?: string
}

export const FiltersDocFooter: FC<FiltersDocFooterProps> = ({ className }) => {
    const { t } = useTranslation('../../branded/src/search-ui/results/filters/components/filters-doc-footer')

    return (
        <footer className={classNames(className, styles.footer)}>
            <Link target="_blank" rel="noopener" to="/help/code_search/reference/queries" className={styles.link}>
                <Icon as={OpenBookIcon} aria-hidden={true} className={styles.linkIcon} />
                <span className={styles.linkText}>
                    <H4 as="span" className="m-0">
                        {t('advanced-filters-question')}
                    </H4>
                    <small>{t('query-syntax-docs-explore')}</small>
                </span>
                <Icon as={LinkShareIcon} aria-hidden={true} className={styles.linkIcon} />
            </Link>
        </footer>
    )
}
