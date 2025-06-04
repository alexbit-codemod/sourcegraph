import type { FC } from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { Timestamp } from '@sourcegraph/branded/src/components/Timestamp'
import { Link } from '@sourcegraph/wildcard'

import type { Maybe, UserAreaUserFields } from '../../graphql-operations'

type UserData = Maybe<Pick<UserAreaUserFields, 'url' | 'username'>>

interface BylineProps {
    createdAt: string
    createdBy?: UserData
    updatedAt: Maybe<string>
    updatedBy?: UserData
    noAuthor?: boolean
    type?: string
}

/**
 * The created/updated byline containing information about creator, creation date, updater and update date.
 */
export const CreatedByAndUpdatedByInfoByline: FC<BylineProps> = ({
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
    noAuthor,
    type,
}) => {
    const { t } = useTranslation('components/Byline')

    const createdByPart = noAuthor ? null : type === 'ExternalService' ? (
        createdBy ? (
            <>
                <Trans
                    i18nKey="created-by-link"
                    values={{ createdByUsername: <>{createdBy.username}</> }}
                    components={{ '0': <Link to={createdBy.url} /> }}
                />
            </>
        ) : null
    ) : (
        <>
            {t('by-space')}
            {createdBy ? <Link to={createdBy.url}>{createdBy.username}</Link> : 'a deleted user'}
        </>
    )

    const updatedPart = (
        <>
            {updatedAt !== null && updatedAt !== createdAt && (
                <>
                    <span className="mx-2">|</span>
                    {type === 'ExternalService' ? (
                        <>
                            {updatedBy?.username && (
                                <>
                                    <Trans
                                        i18nKey="updated-by-link"
                                        values={{ updatedByUsername: <>{updatedBy.username}</> }}
                                        components={{
                                            '0': <Link to={updatedBy.url} />,
                                            '1': <span className="mx-2" />,
                                        }}
                                    />
                                </>
                            )}
                            <>
                                {t('last-synced')}
                                <Timestamp date={updatedAt} />
                            </>
                        </>
                    ) : (
                        <>
                            {t('updated')}
                            <Timestamp date={updatedAt} />
                            {updatedBy?.username !== createdBy?.username && (
                                <>
                                    {t('by-space-updated')}
                                    {updatedBy ? (
                                        <Link to={updatedBy.url}>{updatedBy.username}</Link>
                                    ) : (
                                        'a deleted user'
                                    )}
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    )
    return (
        <>
            {t('created')}
            <Timestamp date={createdAt} /> {createdByPart} {updatedPart}
        </>
    )
}
