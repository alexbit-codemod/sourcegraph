import { useTranslation } from 'react-i18next'

import { Button } from '@sourcegraph/wildcard'

import styles from './FilterPackagesActions.module.scss'

interface FilterPackagesActionsProps {
    valid: boolean
    onDismiss: () => void
}

export const FilterPackagesActions: React.FunctionComponent<FilterPackagesActionsProps> = ({ valid, onDismiss }) => {
    const { t } = useTranslation('site-admin/packages/components')

    return (
        <div className={styles.actionsContainer}>
            <div className={styles.actions}>
                <Button variant="secondary" onClick={onDismiss} className="mr-2">
                    {t('cancel-button')}
                </Button>
                <Button variant="danger" type="submit" name="blocklist" disabled={!valid} className="mr-2">
                    {t('save-button')}
                </Button>
            </div>
        </div>
    )
}
