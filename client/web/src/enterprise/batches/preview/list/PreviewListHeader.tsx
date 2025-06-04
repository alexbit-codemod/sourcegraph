import React from 'react'

import { useTranslation } from 'react-i18next'

import { H3, H5 } from '@sourcegraph/wildcard'

import { InputTooltip } from '../../../../components/InputTooltip'

import styles from './PreviewListHeader.module.scss'

export interface PreviewListHeaderProps {
    allSelected?: boolean
    toggleSelectAll?: () => void
}

export const PreviewListHeader: React.FunctionComponent<React.PropsWithChildren<PreviewListHeaderProps>> = ({
    allSelected,
    toggleSelectAll,
}) => {
    const { t } = useTranslation('enterprise/batches/preview/list')

    return (
        <li className={styles.listItem}>
            <span className="p-2 d-none d-sm-block" />
            {toggleSelectAll && (
                <div className="d-flex p-2 align-items-center">
                    {/* eslint-disable-next-line no-restricted-syntax*/}
                    <InputTooltip
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        tooltip="Click to select all changesets"
                        aria-label="Click to select all changesets"
                        placement="right"
                    />
                    <span className="pl-2 d-block d-sm-none">{t('select-all')}</span>
                </div>
            )}
            <H5 as={H3} className="p-2 d-none d-sm-block text-uppercase text-center" aria-hidden={true}>
                {t('current-state')}
            </H5>
            <H5 as={H3} className="d-none d-sm-block text-uppercase text-center" aria-hidden={true}>
                +<br />-
            </H5>
            <H5 as={H3} className="p-2 d-none d-sm-block text-uppercase text-nowrap" aria-hidden={true}>
                {t('actions')}
            </H5>
            <H5 as={H3} className="p-2 d-none d-sm-block text-uppercase text-nowrap" aria-hidden={true}>
                {t('changeset-information')}
            </H5>
            <H5 as={H3} className="p-2 d-none d-sm-block text-uppercase text-center text-nowrap" aria-hidden={true}>
                {t('commit-changes')}
            </H5>
            <H5 as={H3} className="p-2 d-none d-sm-block text-uppercase text-center text-nowrap" aria-hidden={true}>
                {t('change-state')}
            </H5>
        </li>
    )
}
