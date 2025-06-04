import React from 'react'

import { useTranslation } from 'react-i18next'

import { Code, Text } from '@sourcegraph/wildcard'

/**
 * Used when the env var `DEV_WEB_BUILDER_OMIT_SLOW_DEPS` is set.
 */
export const ApiConsole: React.FunctionComponent = () => {
    const { t } = useTranslation('api')

    return (
        <Text className="border border-danger p-2 mx-auto my-5">
            {t('graph-ql-not-included-bundle')}
            <Code>{t('dev-web-builder-omit-slow-deps')}</Code>
            {t('environment-variable-set')}
        </Text>
    )
}
