import { usePrettifyEditors, useHistoryContext } from '@graphiql/react'
import graphiql from 'graphiql'
import { useTranslation, Trans } from 'react-i18next'

import { Button, Alert, ButtonLink } from '@sourcegraph/wildcard'

import styles from './ApiConsoleToolbar.module.scss'

export const ApiConsoleToolbar: React.FunctionComponent = () => {
    const { t } = useTranslation('api')

    const prettify = usePrettifyEditors()
    const historyContext = useHistoryContext()

    return (
        <graphiql.Toolbar>
            <div className="d-flex align-items-center">
                <Button
                    variant="secondary"
                    title={t('prettify-query-shortcut')}
                    onClick={() => prettify()}
                    className={styles.toolbarButton}
                >
                    {t('prettify-label')}
                </Button>
                <Button
                    variant="secondary"
                    title={t('show-history')}
                    onClick={() => historyContext?.toggle()}
                    className={styles.toolbarButton}
                >
                    {t('history-label')}
                </Button>
                <ButtonLink to="/help/api/graphql" variant="link">
                    {t('docs-label')}
                </ButtonLink>
                <Alert variant="warning" className="py-1 mb-0 ml-2 text-nowrap">
                    <small>
                        <Trans i18nKey="api-console-warning" components={{ '0': <strong /> }} />
                    </small>
                </Alert>
            </div>
        </graphiql.Toolbar>
    )
}

ApiConsoleToolbar.displayName = 'GraphiQLToolbar'
