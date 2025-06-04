import React from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { H3, Text } from '@sourcegraph/wildcard'

import styles from './EmptyPreviewListElement.module.scss'

export const EmptyPreviewListElement: React.FunctionComponent<React.PropsWithChildren<{}>> = () => {
    const { t } = useTranslation('enterprise/batches/preview/list')

    return (
        <div className={styles.emptyPreviewListElementBody}>
            <H3 className="text-center mb-4">{t('no-changesets-created')}</H3>
            <Text>{t('reasons-for-no-changesets')}</Text>
            <Text>
                <strong>
                    <Trans
                        i18nKey="repositories-matching-query-failed"
                        components={{ '0': <span className="text-monospace" /> }}
                    />
                </strong>
            </Text>
            <Text>{t('test-query-in-search-bar')}</Text>
            <Text>
                <strong>
                    <Trans
                        i18nKey="steps-did-not-result-in-changes"
                        components={{ '0': <span className="text-monospace" /> }}
                    />
                </strong>
            </Text>
            <Text>
                <Trans
                    i18nKey="try-command-on-local-instance"
                    components={{ '0': <span className="text-monospace" /> }}
                />
            </Text>
        </div>
    )
}
