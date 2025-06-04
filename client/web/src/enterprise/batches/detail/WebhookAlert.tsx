import React, { useCallback, useState } from 'react'

import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'

import { pluralize } from '@sourcegraph/common'
import { Button, useObservable, Link, H4, Text } from '@sourcegraph/wildcard'

import { authenticatedUser } from '../../../auth'
import { DismissibleAlert } from '../../../components/DismissibleAlert'
import type { BatchChangeFields } from '../../../graphql-operations'
import { CodeHost } from '../CodeHost'

import styles from './WebhookAlert.module.scss'

export interface Props {
    batchChange: Pick<BatchChangeFields, 'id' | 'currentSpec'>

    // isSiteAdmin is only here for storybook purposes.
    isSiteAdmin?: boolean
}

export const WebhookAlert: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    batchChange: {
        id,
        currentSpec: {
            codeHostsWithoutWebhooks: {
                nodes,
                pageInfo: { hasNextPage },
                totalCount,
            },
        },
    },
    isSiteAdmin,
}) => {
    const { t } = useTranslation('enterprise/batches/detail')

    const user = useObservable(authenticatedUser)
    if (isSiteAdmin === undefined) {
        isSiteAdmin = user?.siteAdmin === true
    }

    const [open, setOpen] = useState(false)
    const toggleOpen = useCallback(() => setOpen(!open), [open])

    if (window.context.batchChangesDisableWebhooksWarning) {
        return null
    }

    if (totalCount === 0) {
        return null
    }

    const SITE_ADMIN_CONFIG_DOC_URL = '/help/batch_changes/how-tos/site_admin_configuration'

    return (
        <DismissibleAlert variant="warning" partialStorageKey={id}>
            <div>
                <H4>{t('changeset-info-not-up-to-date')}</H4>
                <Text className={styles.blurb}>
                    {t('sourcegraph-poll-for-updates')}
                    <Button className={classNames(styles.openLink, 'p-0')} onClick={toggleOpen} variant="link">
                        {totalCount}{' '}
                        {pluralize('code host is not configured', totalCount, 'code hosts are not configured')}
                    </Button>
                    {t('use-webhooks-instructions')}
                    {isSiteAdmin ? (
                        <>
                            <Trans
                                i18nKey="learn-configure-webhooks"
                                components={{ '0': <Link to={SITE_ADMIN_CONFIG_DOC_URL} /> }}
                            />
                        </>
                    ) : (
                        <>
                            <Trans
                                i18nKey="ask-admin-configure-webhooks"
                                components={{ '0': <Link to={SITE_ADMIN_CONFIG_DOC_URL} /> }}
                            />
                        </>
                    )}
                </Text>
                {open && (
                    <ul>
                        {nodes.map(codeHost => (
                            <li key={codeHost.externalServiceKind + codeHost.externalServiceURL}>
                                <CodeHost {...codeHost} />
                            </li>
                        ))}
                        {hasNextPage && (
                            <li key="and-more">
                                {t('more-items-available', { totalCountNodesLength: totalCount - nodes.length })}
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </DismissibleAlert>
    )
}
