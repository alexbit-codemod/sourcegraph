import React from 'react'

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { Button, ButtonGroup, Input } from '@sourcegraph/wildcard'

import type { DiffMode } from './RepositoryCommitPage'

import styles from './DiffModeSelector.module.scss'

interface DiffModeSelectorProps {
    className?: string
    small?: boolean
    onHandleDiffMode: (mode: DiffMode) => void
    diffMode: DiffMode
}

export const DiffModeSelector: React.FunctionComponent<DiffModeSelectorProps> = ({
    className,
    diffMode,
    onHandleDiffMode,
    small,
}) => {
    const { t } = useTranslation('repo/commit')

    return (
        <div className={className}>
            <ButtonGroup>
                <Button
                    size={small ? 'sm' : undefined}
                    variant="secondary"
                    outline={diffMode !== 'unified'}
                    className={classNames(styles.button, 'mb-0')}
                    as="label"
                    htmlFor="diff-mode-selector-unified"
                >
                    <Input
                        type="radio"
                        name="diff-mode"
                        value="unified"
                        checked={diffMode === 'unified'}
                        onChange={event => onHandleDiffMode(event.target.value as DiffMode)}
                        className="sr-only"
                        id="diff-mode-selector-unified"
                    />
                    {t('unified-message')}
                </Button>
                <Button
                    size={small ? 'sm' : undefined}
                    variant="secondary"
                    outline={diffMode !== 'split'}
                    className={classNames(styles.button, 'mb-0')}
                    as="label"
                    htmlFor="diff-mode-selector-split"
                >
                    <Input
                        type="radio"
                        name="diff-mode"
                        value="split"
                        checked={diffMode === 'split'}
                        onChange={event => onHandleDiffMode(event.target.value as DiffMode)}
                        className="sr-only"
                        id="diff-mode-selector-split"
                    />
                    {t('split-message')}
                </Button>
            </ButtonGroup>
        </div>
    )
}
