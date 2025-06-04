import { mdiClose } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { Button, Icon, Text } from '@sourcegraph/wildcard'

import styles from './Callout.module.scss'

export const Callout: React.FC<{ dismiss: () => void }> = ({ dismiss }) => {
    const { t } = useTranslation('cody/components/ScopeSelector')

    return (
        <div className={styles.wrapper}>
            <div className={styles.box}>
                <div className={styles.header}>
                    <div className={styles.headerElements}>{t('give-cody-context')}</div>
                    <Button className={styles.closeButton} onClick={dismiss} variant="icon" aria-label="Close">
                        <Icon aria-hidden={true} svgPath={mdiClose} />
                    </Button>
                </div>
                <Text className={classNames('mb-0 mt-1', styles.content)} size="small">
                    {t('tell-cody-codebases')}
                </Text>
            </div>
            <div className={styles.tail} />
        </div>
    )
}
