import { type FC, useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Alert } from '@sourcegraph/wildcard'

interface Props {
    to: string
    messagePrefix: string
    className?: string
}

/**
 * The repository settings options page.
 */
export const RedirectionAlert: FC<Props> = ({ to, className, messagePrefix }) => {
    const { t } = useTranslation('repo/settings/components')

    const [ttl, setTtl] = useState(3)
    const navigate = useNavigate()

    useEffect(() => {
        const interval = setInterval(() => setTtl(ttl => ttl - 1), 700)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (ttl === 0) {
            navigate(to)
        }
    }, [ttl, navigate, to])

    return (
        <Alert className={className} variant="success">
            {t('redirect-message-ttl', { messagePrefix, ttl })}
        </Alert>
    )
}
