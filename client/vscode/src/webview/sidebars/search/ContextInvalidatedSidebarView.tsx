import React from 'react'

import { useTranslation } from 'react-i18next'

import { Button, H5, Text } from '@sourcegraph/wildcard'

import type { WebviewPageProps } from '../../platform/context'

export interface ContextInvalidatedSidebarViewProps extends WebviewPageProps {}

export const ContextInvalidatedSidebarView: React.FunctionComponent<
    React.PropsWithChildren<ContextInvalidatedSidebarViewProps>
> = ({ extensionCoreAPI }) => {
    const { t } = useTranslation('../../vscode/src/webview/sidebars/search')

    return (
        <div>
            <H5 className="mt-3 mb-2">{t('new-url-detected')}</H5>
            <Text>{t('sourcegraph-url-changed')}</Text>
            <Text>{t('reload-vs-code-for-sourcegraph')}</Text>
            <Button
                variant="primary"
                className="font-weight-normal w-100 my-1 border-0"
                onClick={() => extensionCoreAPI.reloadWindow()}
            >
                {t('reload-vs-code-button')}
            </Button>
        </div>
    )
}
