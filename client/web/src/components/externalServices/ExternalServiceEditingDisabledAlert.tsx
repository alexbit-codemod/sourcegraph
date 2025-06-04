import type { FC } from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { Alert, H4, Code, Text, Link } from '@sourcegraph/wildcard'

export const ExternalServiceEditingDisabledAlert: FC<{ className?: string }> = props => {
    const { t } = useTranslation('components/externalServices')

    return (
        <Alert variant="info" className={props.className}>
            <H4>{t('editing-through-ui-disabled')}</H4>
            <Text className="mb-0">
                {t('environment-variable-prefix')}
                <Code>{t('extsvc-config-file-name')}</Code>
                <Trans
                    i18nKey="extsvc-config-file-warning"
                    components={{ '0': <Link to="/help/admin/config/advanced_config_file#code-host-configuration" /> }}
                />
                <Code>{t('extsvc-config-allow-edits')}</Code>
                {t('set-to')}
                <Code>{t('true-value')}</Code>
                {t('edit-code-host-warning')}
            </Text>
        </Alert>
    )
}
