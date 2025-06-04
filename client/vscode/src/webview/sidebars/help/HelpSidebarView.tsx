import React, { useEffect, useState } from 'react'

import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { Button, Text } from '@sourcegraph/wildcard'

import { version } from '../../../../package.json'
import {
    VSCE_LINK_FEEDBACK,
    VSCE_LINK_ISSUES,
    VSCE_LINK_TROUBLESHOOT,
    VSCE_SG_LOGOMARK_DARK,
    VSCE_SG_LOGOMARK_LIGHT,
    VSCE_LINK_SIGNUP,
} from '../../../common/links'
import type { WebviewPageProps } from '../../platform/context'
import { AuthSidebarView } from '../auth/AuthSidebarView'

import styles from './HelpSidebarView.module.scss'

interface HelpSidebarViewProps
    extends Pick<WebviewPageProps, 'extensionCoreAPI' | 'platformContext' | 'authenticatedUser' | 'instanceURL'> {}

/**
 * Rendered by sidebar in search-home state when user doesn't have a valid access token.
 */
export const HelpSidebarView: React.FunctionComponent<React.PropsWithChildren<HelpSidebarViewProps>> = ({
    platformContext,
    extensionCoreAPI,
    authenticatedUser,
    instanceURL,
}) => {
    const { t } = useTranslation('../../vscode/src/webview/sidebars/help')

    const [openAuthPanel, setOpenAuthPanel] = useState(false)
    const [isLightTheme, setIsLightTheme] = useState<boolean | undefined>(undefined)

    useEffect(() => {
        if (isLightTheme === undefined) {
            extensionCoreAPI.getEditorTheme
                .then(theme => {
                    setIsLightTheme(theme === 'Light')
                })
                .catch(error => {
                    console.error(error)
                    setIsLightTheme(false)
                })
        }
    }, [extensionCoreAPI.getEditorTheme, isLightTheme])

    const onHelpItemClick = async (url: string, item: string): Promise<void> => {
        platformContext.telemetryService.log(`VSCEHelpSidebar${item}Click`)
        await extensionCoreAPI.openLink(url)
    }

    const onLogoutClick = async (): Promise<void> => {
        if (authenticatedUser) {
            await extensionCoreAPI.removeAccessToken()
        }
    }

    return (
        <div className={classNames(styles.sidebarContainer)}>
            <Button
                as={VSCodeButton}
                onClick={() => onHelpItemClick(VSCE_LINK_FEEDBACK, 'Feedback')}
                className={classNames('p-0 m-0', styles.sidebarViewButton)}
            >
                {t('give-feedback')}
            </Button>
            <Button
                as={VSCodeButton}
                onClick={() => onHelpItemClick(VSCE_LINK_ISSUES, 'Issues')}
                className={classNames('p-0 m-0', styles.sidebarViewButton)}
            >
                {t('report-issue')}
            </Button>
            <Button
                as={VSCodeButton}
                onClick={() => onHelpItemClick(VSCE_LINK_TROUBLESHOOT, 'Troubleshoot')}
                className={classNames('p-0 m-0', styles.sidebarViewButton)}
            >
                {t('troubleshooting-docs')}
            </Button>
            <Button
                as={VSCodeButton}
                onClick={() => onHelpItemClick(VSCE_LINK_SIGNUP, 'Authenticate')}
                className={classNames('p-0 m-0', styles.sidebarViewButton)}
            >
                <img
                    alt="sg-logo"
                    className={styles.icon}
                    slot="start"
                    src={isLightTheme ? VSCE_SG_LOGOMARK_DARK : VSCE_SG_LOGOMARK_LIGHT}
                />
                {t('create-new-account')}
            </Button>
            <Button
                as={VSCodeButton}
                onClick={() => setOpenAuthPanel(previousOpenAuthPanel => !previousOpenAuthPanel)}
                className={classNames('p-0 m-0', styles.sidebarViewButton)}
            >
                {authenticatedUser ? `User: ${authenticatedUser.username}` : 'Authenticate account'}
            </Button>
            {openAuthPanel && (
                <div className="ml-3 mt-1">
                    {!authenticatedUser ? (
                        <AuthSidebarView
                            instanceURL={instanceURL}
                            extensionCoreAPI={extensionCoreAPI}
                            platformContext={platformContext}
                            authenticatedUser={authenticatedUser}
                        />
                    ) : (
                        <div className="mt-1">
                            <Text className="ml-2 small">
                                {t('sign-out-instruction')}
                                {new URL(instanceURL).hostname}
                                {t('vs-code-reload-notice')}
                            </Text>
                            <Button
                                variant="primary"
                                size="sm"
                                className="font-weight-normal w-100 my-1 border-0 small"
                                onClick={() => onLogoutClick()}
                            >
                                {t('sign-out')}
                            </Button>
                        </div>
                    )}
                </div>
            )}
            <Button as={VSCodeButton} className={classNames('p-0 m-0', styles.sidebarViewButton)}>
                {t('version-info', { version })}
            </Button>
        </div>
    )
}
