import React from 'react'

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { H2, H3, H5 } from '@sourcegraph/wildcard'

import styles from './BatchChangeCloseHeader.module.scss'

export interface BatchChangeCloseHeaderProps {
    // Nothing.
}

const BatchChangeCloseHeader: React.FunctionComponent<React.PropsWithChildren<BatchChangeCloseHeaderProps>> = () => {
    const { t } = useTranslation('enterprise/batches/close')

    return (
        <>
            <span className="d-none d-md-block" />
            <H5 as={H3} aria-hidden={true} className="d-none d-md-block text-uppercase text-center text-nowrap">
                {t('action-label')}
            </H5>
            <H5 as={H3} aria-hidden={true} className="d-none d-md-block text-uppercase text-nowrap">
                {t('changeset-info')}
            </H5>
            <H5 as={H3} aria-hidden={true} className="d-none d-md-block text-uppercase text-center text-nowrap">
                {t('check-state')}
            </H5>
            <H5 as={H3} aria-hidden={true} className="d-none d-md-block text-uppercase text-center text-nowrap">
                {t('review-state')}
            </H5>
            <H5 as={H3} aria-hidden={true} className="d-none d-md-block text-uppercase text-center text-nowrap">
                {t('changes-label')}
            </H5>
        </>
    )
}

export const BatchChangeCloseHeaderWillCloseChangesets: React.FunctionComponent<
    React.PropsWithChildren<BatchChangeCloseHeaderProps>
> = () => {
    const { t } = useTranslation('enterprise/batches/close')

    return (
        <>
            <H2 className={classNames(styles.batchChangeCloseHeaderRow, 'test-batches-close-willclose-header')}>
                {t('closing-batch-change-warning')}
            </H2>
            <BatchChangeCloseHeader />
        </>
    )
}

export const BatchChangeCloseHeaderWillKeepChangesets: React.FunctionComponent<
    React.PropsWithChildren<BatchChangeCloseHeaderProps>
> = () => {
    const { t } = useTranslation('enterprise/batches/close')

    return (
        <>
            <H2 className={styles.batchChangeCloseHeaderRow}>{t('remaining-changesets-warning')}</H2>
            <BatchChangeCloseHeader />
        </>
    )
}
