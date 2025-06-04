import { useTranslation } from 'react-i18next'

import { AskCodyIcon } from '@sourcegraph/cody-ui'
import { Button, Tooltip } from '@sourcegraph/wildcard'

import styles from './AskCodyButton.module.scss'

export function AskCodyButton({ onClick }: { onClick: () => void }): JSX.Element {
    const { t } = useTranslation('repo/cody')

    return (
        <div className="d-flex align-items-center">
            <Tooltip content="Open Cody" placement="bottom">
                <Button className={styles.codyButton} onClick={onClick}>
                    <AskCodyIcon iconColor="#A112FF" />
                    {t('cody-name')}
                </Button>
            </Tooltip>
        </div>
    )
}
