import React from 'react'

import { mdiCancel } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { Icon } from '@sourcegraph/wildcard'

import styles from './EmptyPanelView.module.scss'

interface EmptyPanelViewProps {
    className?: string
}

export const EmptyPanelView: React.FunctionComponent<React.PropsWithChildren<EmptyPanelViewProps>> = props => {
    const { t } = useTranslation('../../branded/src/components/panel/views')

    const { className, children } = props

    return (
        <div className={classNames(styles.emptyPanel, className)}>
            {children || (
                <>
                    <Icon className="mr-2" aria-hidden={true} svgPath={mdiCancel} />
                    {t('nothing-to-show-here')}
                </>
            )}
        </div>
    )
}
