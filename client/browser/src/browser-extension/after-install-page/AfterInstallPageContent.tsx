import React, { type VideoHTMLAttributes } from 'react'

import { mdiOpenInNew, mdiGithub, mdiCheck, mdiGitlab, mdiBitbucket, mdiLock, mdiBookOpenPageVariant } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'

import { SourcegraphLogo } from '@sourcegraph/branded/src/components/SourcegraphLogo'
import { PhabricatorIcon } from '@sourcegraph/shared/src/components/icons'
import { Link, Icon, Code, H1, H2, H3, Text } from '@sourcegraph/wildcard'

import { getPlatformName } from '../../shared/util/context'

import styles from './AfterInstallPageContent.module.scss'

interface VideoProps extends Pick<VideoHTMLAttributes<HTMLVideoElement>, 'width' | 'height'> {
    name: string
    isLightTheme: boolean
}

const Video: React.FC<VideoProps> = ({ name, isLightTheme, width, height }) => {
    const suffix = isLightTheme ? 'Light' : 'Dark'
    return (
        <video
            className="w-100 h-auto cursor-pointer"
            width={width}
            height={height}
            autoPlay={true}
            loop={true}
            muted={true}
            playsInline={true}
            onClick={event => event.currentTarget.requestFullscreen()}
            // Add a key on the theme to force React to render a new <video> element when the theme changes
            key={name + suffix}
        >
            <source
                src={`https://storage.googleapis.com/sourcegraph-assets/code-host-integration/${name}${suffix}.webm`}
                type="video/webm"
            />
            <source
                src={`https://storage.googleapis.com/sourcegraph-assets/code-host-integration/${name}${suffix}.mp4`}
                type="video/mp4"
            />
        </video>
    )
}

interface AfterInstallPageContentProps {
    isLightTheme: boolean
}

export const AfterInstallPageContent: React.FC<AfterInstallPageContentProps> = props => {
    const { t } = useTranslation('../../browser/src/browser-extension/after-install-page')

    // Safari does not support the search shortcut. So don't show the feature.
    const isSafari = getPlatformName() === 'safari-extension'
    const showSearchShortcut = !isSafari

    return (
        <div className="after-install-page-content" data-testid="after-install-page-content">
            <div className="d-flex w-100 p-3 justify-content-between align-items-center">
                <Link to="https://sourcegraph.com/search" target="_blank" rel="noopener">
                    <SourcegraphLogo className={styles.sourcegraphLogo} />
                </Link>
                <Link to="https://sourcegraph.com/docs/integration/browser_extension" target="_blank" rel="noopener">
                    {t('browser-extension-docs')}
                    <Icon aria-hidden={true} svgPath={mdiOpenInNew} />
                </Link>
            </div>

            <div className="container mt-3">
                <H1>{t('extension-installed-message')}</H1>
                <Text className="lead mb-0">{t('important-information-started')}</Text>
            </div>

            <section className="border-bottom py-5">
                <div className="container">
                    <H2 className="mb-4">{t('how-to-use-extension')}</H2>
                    <div className="row">
                        <div className="col-md-6">
                            <H3>{t('code-navigation-code-host')}</H3>
                            <Text>{t('sourcegraph-extension-navigation-info')}</Text>
                            <Video {...props} name="CodeIntelligenceOnCodeHost" width={1760} height={1060} />
                        </div>
                        {showSearchShortcut && (
                            <div className="col-md-6 mt-4 mt-md-0">
                                <H3>{t('search-shortcut-url-bar')}</H3>
                                <Text>
                                    {t('type-src')}
                                    <Code>{t('src-key')}</Code>
                                    <Trans i18nKey="search-queries-sourcegraph" components={{ '0': <kbd /> }} />
                                </Text>
                                <Video {...props} name="BrowserShortcut" width={1196} height={720} />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="border-bottom py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 d-flex flex-column">
                            <H2 className="mb-4">{t('make-it-work-codehost')}</H2>
                            <div className="bg-2 rounded p-3 mb-3 d-flex flex-column justify-content-center">
                                <H3 className={classNames('mb-3', styles.codeHostTitles)}>
                                    <Icon className={styles.codeHostLogo} aria-hidden={true} svgPath={mdiGithub} />
                                    {t('github-url')}
                                </H3>
                                <Text className="m-0">
                                    <Icon aria-hidden={true} svgPath={mdiCheck} />
                                    {t('no-action-required-extension')}
                                </Text>
                            </div>
                            <div className="bg-2 rounded p-3 d-flex flex-column justify-content-center">
                                <H3 className={classNames('d-flex flex-wrap', styles.codeHostTitles)}>
                                    <div className="mr-5 mb-3">
                                        <Icon className={styles.codeHostLogo} aria-hidden={true} svgPath={mdiGithub} />
                                        {t('github-enterprise-url')}
                                    </div>
                                    <div className="mr-5 mb-3">
                                        <Icon className={styles.codeHostLogo} aria-hidden={true} svgPath={mdiGitlab} />
                                        {t('gitlab-url')}
                                    </div>
                                    <div className="mr-5 mb-3">
                                        <Icon
                                            className={styles.codeHostLogo}
                                            aria-hidden={true}
                                            svgPath={mdiBitbucket}
                                        />
                                        {t('bitbucket-server-url')}
                                    </div>
                                    <div className="mr-5 mb-3">
                                        <Icon className={styles.codeHostLogo} as={PhabricatorIcon} aria-hidden={true} />
                                        {t('phabricator-url')}
                                    </div>
                                </H3>
                                <Text>{t('explicit-permissions-required')}</Text>
                                <ol className="m-0">
                                    <li>{t('navigate-to-code-host')}</li>
                                    <li>
                                        <Trans
                                            i18nKey="grant-permissions-button"
                                            values={{
                                                strongGrantPermissionsStrong: (
                                                    <>
                                                        <strong>Grant permissions</strong>
                                                    </>
                                                ),
                                            }}
                                            components={{ '0': <q /> }}
                                        />
                                    </li>
                                    <li>
                                        <Trans
                                            i18nKey="allow-permissions-popup"
                                            values={{
                                                strongAllowStrong: (
                                                    <>
                                                        <strong>Allow</strong>
                                                    </>
                                                ),
                                            }}
                                            components={{ '0': <q /> }}
                                        />
                                    </li>
                                </ol>
                            </div>
                        </div>
                        <div className="col-md-6 mt-4 mt-md-0">
                            <Video {...props} name="GrantPermissions" width={1762} height={1384} />
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-bottom py-5">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 d-flex flex-column">
                            <H2 className="mb-4">{t('make-it-work-private-code')}</H2>
                            <Text>{t('extension-public-code-only')}</Text>
                            <div className="d-flex align-items-center">
                                <div className="bg-3 rounded-circle p-2">
                                    <Icon aria-hidden={true} svgPath={mdiLock} />
                                </div>
                                <Text className="m-0 ml-3">
                                    <Trans
                                        i18nKey="setup-private-sourcegraph-instance"
                                        components={{ '0': <strong /> }}
                                    />
                                </Text>
                            </div>
                            <div className="bg-2 rounded p-3 mt-4 d-flex flex-column justify-content-around">
                                <Text>{t('follow-instructions')}</Text>
                                <ol className="m-0 d-flex flex-column justify-content-around">
                                    <li>
                                        <Trans
                                            i18nKey="install-sourcegraph-instructions"
                                            components={{
                                                '0': <strong />,
                                                '1': (
                                                    <Link
                                                        to="https://sourcegraph.com/docs/admin/install"
                                                        target="_blank"
                                                        rel="noopener"
                                                    />
                                                ),
                                            }}
                                        />
                                    </li>
                                    <li>
                                        <Trans
                                            i18nKey="open-settings-page"
                                            components={{
                                                '0': <Link to="./options.html" rel="noopener" target="_blank" />,
                                            }}
                                        />
                                    </li>
                                    <li>
                                        <Trans
                                            i18nKey="enter-sourcegraph-url"
                                            components={{ '0': <strong />, '1': <q /> }}
                                        />
                                    </li>
                                    <li>{t('checkmark-input-field')}</li>
                                </ol>
                            </div>
                        </div>
                        <div className="col-md-6 mt-4 mt-md-0">
                            <Video {...props} name="PrivateInstance" width={1764} height={1390} />
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-5">
                <div className="container">
                    <H2 className="mb-4">{t('additional-resources')}</H2>
                    <div className="d-flex w-100 align-items-center">
                        <div className="bg-3 rounded-circle p-2">
                            <Icon aria-hidden={true} svgPath={mdiBookOpenPageVariant} />
                        </div>
                        <Text className="m-0 ml-3">
                            <Trans
                                i18nKey="read-sourcegraph-docs"
                                components={{
                                    '0': (
                                        <Link
                                            to="https://sourcegraph.com/docs/integration/browser_extension"
                                            rel="noopener"
                                            target="_blank"
                                        />
                                    ),
                                }}
                            />
                        </Text>
                    </div>
                </div>
            </section>
        </div>
    )
}
