import ServerIcon from 'mdi-react/ServerIcon'
import { useTranslation } from 'react-i18next'

import { FeedbackText } from '@sourcegraph/wildcard'

import { HeroPage } from './components/HeroPage'

import styles from './PageError.module.scss'

interface Props {
    pageError: PageError
}
export const PageError: React.FC<Props> = ({ pageError }) => {
    const { t } = useTranslation('')

    const statusCode = pageError.statusCode
    const statusText = pageError.statusText
    const errorMessage = pageError.error
    const errorID = pageError.errorID

    let subtitle: JSX.Element | undefined
    if (errorID) {
        subtitle = <FeedbackText headerText={t('sorry-problem')} />
    }
    if (errorMessage) {
        subtitle = (
            <div className={styles.error}>
                {subtitle}
                {subtitle && <hr className="my-3" />}
                <pre>{errorMessage}</pre>
            </div>
        )
    } else {
        subtitle = <div className={styles.error}>{subtitle}</div>
    }

    return <HeroPage icon={ServerIcon} title={`${statusCode}: ${statusText}`} subtitle={subtitle} />
}
