import type { FC } from 'react'

import { useTranslation } from 'react-i18next'

import { Alert, H4, Code, Text } from '@sourcegraph/wildcard'

export const ExternalServiceEditingTemporaryAlert: FC<{ className?: string }> = props => {
    const { t } = useTranslation('components/externalServices')

    return (
        <Alert variant="warning" className={props.className}>
            <H4>{t('edits-reset-restart')}</H4>
            <Text className="mb-0">
                {t('environment-variable-intro')}
                <Code>{t('extsvc-config-allow-edits')}</Code>
                {t('environment-variable-set')}
                <Code>{t('extsvc-config-file')}</Code>
                {t('changes-undo-next-restart')}
                <Code>{t('extsvc-config-file-repeat')}</Code>.
            </Text>
        </Alert>
    )
}
