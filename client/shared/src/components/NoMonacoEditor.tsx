import React from 'react'

import { useTranslation } from 'react-i18next'

import { Code, Text } from '@sourcegraph/wildcard'

/**
 * Used when the env var `DEV_WEB_BUILDER_OMIT_SLOW_DEPS` is set.
 */
export const MonacoEditor: React.FunctionComponent = () => {
    const { t } = useTranslation('../../shared/src/components')

    return (
        <Text className="border border-danger p-2">
            {t('monaco-editor-not-included')}
            <Code>{t('dev-web-builder-omit-slow-deps')}</Code>
            {t('environment-variable-set')}
        </Text>
    )
}
