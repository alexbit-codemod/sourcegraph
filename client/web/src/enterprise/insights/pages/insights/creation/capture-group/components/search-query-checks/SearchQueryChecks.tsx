import type { FC, PropsWithChildren } from 'react'

import { mdiClose, mdiRadioboxBlank } from '@mdi/js'
import { VisuallyHidden } from '@reach/visually-hidden'
import classNames from 'classnames'
import Check from 'mdi-react/CheckIcon'
import { useTranslation } from 'react-i18next'

import { Icon, Code } from '@sourcegraph/wildcard'

import styles from './SearchQueryChecks.module.scss'

interface SearchQueryChecksProps {
    checks?: {
        isValidOperator: true | false | undefined
        isValidPatternType: true | false | undefined
        isNotRepo: true | false | undefined
        isNotCommitOrDiff: true | false | undefined
        isNotRev: true | false | undefined
    }
}

export const SearchQueryChecks: FC<SearchQueryChecksProps> = ({ checks }) => {
    const { t } = useTranslation(
        'enterprise/insights/pages/insights/creation/capture-group/components/search-query-checks'
    )

    return (
        <ul aria-label="Search query validation checks list" className={classNames(styles.checks)}>
            <CheckListItem
                errorMessage="shouldn't contain boolean operators, AND, OR, NOT (regular
                expression boolean operators can still be used)"
                valid={checks?.isValidOperator}
            >
                {t('does-not-contain-boolean-operators')}
                <Code>{t('and-operator')}</Code>, <Code>{t('or-operator')}</Code>
                {t('and-separator')}
                <Code>{t('not-operator')}</Code>
                {t('does-not-contain-regular-expression-operators')}
            </CheckListItem>
            <CheckListItem
                errorMessage="shouldn't contain 'keyword', 'literal', or 'structural' patterntype"
                valid={checks?.isValidPatternType}
            >
                {t('does-not-contain-a')}
                <Code>{t('pattern-type-keyword')}</Code>, <Code>{t('standard-pattern')}</Code>,{' '}
                <Code>{t('literal-pattern')}</Code>
                {t('or-space')}
                <Code>{t('structural-pattern')}</Code>{' '}
            </CheckListItem>
            <CheckListItem errorMessage="shouldn't contain repo filter" valid={checks?.isNotRepo}>
                {t('does-not-contain')}
                <Code>{t('repo-filter')}</Code>
                {t('filter-message')}
            </CheckListItem>
            <CheckListItem errorMessage="shouldn't contain rev filter" valid={checks?.isNotRev}>
                {t('does-not-contain')}
                <Code>{t('rev-filter')}</Code>
                {t('filter-message')}
            </CheckListItem>
            <CheckListItem errorMessage="shouldn't contain commit or diff search" valid={checks?.isNotCommitOrDiff}>
                {t('does-not-contain')}
                <Code>{t('commit-pattern')}</Code>
                {t('or-space')}
                <Code>{t('diff-pattern')}</Code>
                {t('search-message')}
            </CheckListItem>
        </ul>
    )
}

interface CheckListItemProps {
    valid: true | false | undefined
    errorMessage: string
}

const CheckListItem: FC<PropsWithChildren<CheckListItemProps>> = props => {
    const { t } = useTranslation(
        'enterprise/insights/pages/insights/creation/capture-group/components/search-query-checks'
    )

    const { valid, errorMessage, children } = props

    if (valid === true) {
        return (
            <li aria-label="Successful validation check">
                <Icon aria-hidden={true} className={classNames(styles.icon, 'text-success')} as={Check} />
                <span className={classNames(styles.valid, 'text-muted')}>{children}</span>
            </li>
        )
    }

    if (valid === false) {
        return (
            <li role="alert" aria-live="polite">
                <Icon aria-hidden={true} className={classNames(styles.icon, 'text-danger')} svgPath={mdiClose} />
                <span aria-hidden={true} className="text-muted">
                    {children}
                </span>
                <VisuallyHidden>{t('failed-validation-check', { errorMessage })}</VisuallyHidden>
            </li>
        )
    }

    return (
        <li aria-label="Validation rule">
            <Icon aria-hidden={true} className={classNames(styles.icon, styles.smaller)} svgPath={mdiRadioboxBlank} />{' '}
            <span className="text-muted">{children}</span>
        </li>
    )
}
