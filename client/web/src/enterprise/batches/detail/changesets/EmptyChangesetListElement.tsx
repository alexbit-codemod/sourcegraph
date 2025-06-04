import React from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { H2, Text } from '@sourcegraph/wildcard'

import styles from './EmptyChangesetListElement.module.scss'

export const EmptyChangesetListElement: React.FunctionComponent<React.PropsWithChildren<{}>> = () => {
    const { t } = useTranslation('enterprise/batches/detail/changesets')

    return (
        <div className={styles.emptyChangesetListElementBody}>
            <H2 className="text-center mb-4">{t('batch-change-no-changesets')}</H2>
            <Text>{t('reasons-for-no-changesets')}</Text>
            <Text>
                <strong>
                    <Trans
                        i18nKey="repositories-matching-query-no-match"
                        components={{ '0': <span className="text-monospace" /> }}
                    />
                </strong>
            </Text>
            <Text>{t('test-query-in-search-bar')}</Text>
            <Text>
                <strong>
                    <Trans
                        i18nKey="steps-code-no-changes-made"
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
