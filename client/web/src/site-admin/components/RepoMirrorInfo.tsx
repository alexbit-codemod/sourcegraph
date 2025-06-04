import * as React from 'react'

import { useTranslation } from 'react-i18next'

import { Timestamp } from '@sourcegraph/branded/src/components/Timestamp'
import { Text, Tooltip } from '@sourcegraph/wildcard'

import type { MirrorRepositoryInfoFields } from '../../graphql-operations'
import { prettyBytesBigint } from '../../util/prettyBytesBigint'

export const RepoMirrorInfo: React.FunctionComponent<
    React.PropsWithChildren<{
        mirrorInfo: MirrorRepositoryInfoFields
    }>
> = ({ mirrorInfo }) => {
    const { t } = useTranslation('site-admin/components')

    return (
        <>
            <Text className="mb-0 text-muted">
                <small>
                    {mirrorInfo.updatedAt === null ? (
                        <>{t('not-yet-synced-from-code-host')}</>
                    ) : (
                        <>
                            {t('last-synced-time')}
                            <Timestamp date={mirrorInfo.updatedAt} />
                            {t('next-sync-time')}
                            {mirrorInfo.nextSyncAt === null ? (
                                <>{t('no-update-scheduled')}</>
                            ) : (
                                <Timestamp date={mirrorInfo.nextSyncAt} />
                            )}
                            {t('size-info')}
                            {prettyBytesBigint(BigInt(mirrorInfo.byteSize))}.
                            {mirrorInfo.shard !== null && (
                                <>
                                    {t('shard-info')}
                                    {mirrorInfo.shard}
                                </>
                            )}
                            {mirrorInfo.shard === null && (
                                <>
                                    {t('shard-label')}
                                    <Tooltip content="The repo has not yet been picked up by a gitserver instance.">
                                        <span>{t('not-assigned')}</span>
                                    </Tooltip>
                                </>
                            )}
                        </>
                    )}
                </small>
            </Text>
        </>
    )
}
