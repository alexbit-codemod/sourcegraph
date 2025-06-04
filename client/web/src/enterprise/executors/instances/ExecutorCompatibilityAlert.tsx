import React from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { Alert, Text, Link } from '@sourcegraph/wildcard'

import { ExecutorCompatibility } from '../../../graphql-operations'

export interface ExecutorCompatibilityAlertProps {
    hostname: string
    compatibility: ExecutorCompatibility
}

export const ExecutorCompatibilityAlert: React.FunctionComponent<
    React.PropsWithChildren<ExecutorCompatibilityAlertProps>
> = ({ hostname, compatibility }) => {
    const { t } = useTranslation('enterprise/executors/instances')

    switch (compatibility) {
        case ExecutorCompatibility.OUTDATED: {
            return (
                <Alert variant="warning" className="mt-3 mb-0">
                    <Text className="m-0">{t('hostname-outdated', { hostname })}</Text>
                    <Text className="m-0">
                        <Trans
                            i18nKey="upgrade-executor-link"
                            components={{
                                '0': (
                                    <Link to="/help/admin/executors/deploy_executors" target="_blank" rel="noopener" />
                                ),
                            }}
                        />
                    </Text>
                </Alert>
            )
        }
        case ExecutorCompatibility.VERSION_AHEAD: {
            return (
                <Alert variant="warning" className="mt-3 mb-0">
                    <Text className="m-0">{t('sourcegraph-instance-outdated')}</Text>
                    <Text className="m-0">
                        <Trans
                            i18nKey="upgrade-or-downgrade-sourcegraph"
                            components={{
                                '0': <Link to="/help/admin/updates" target="_blank" rel="noopener" />,
                                '1': (
                                    <Link to="/help/admin/executors/deploy_executors" target="_blank" rel="noopener" />
                                ),
                            }}
                        />
                    </Text>
                </Alert>
            )
        }
        case ExecutorCompatibility.UP_TO_DATE: {
            return null
        }
    }
}
