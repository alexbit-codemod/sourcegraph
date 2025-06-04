import React, { useEffect } from 'react'

import { mdiOpenInNew } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'

import type { AuthenticatedUser } from '@sourcegraph/shared/src/auth'
import { useTemporarySetting } from '@sourcegraph/shared/src/settings/temporary/useTemporarySetting'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { useIsLightTheme } from '@sourcegraph/shared/src/theme'
import { Container, H2, H3, Icon, Link, Text, useReducedMotion } from '@sourcegraph/wildcard'

import { PageRoutes } from '../../routes.constants'

import styles from './NotebooksGettingStartedTab.module.scss'

interface NotebooksGettingStartedTabProps extends TelemetryProps {
    authenticatedUser: AuthenticatedUser | null
}

const functionalityPanels = [
    {
        title: 'Keep your docs current with symbol blocks',
        description:
            'Symbol blocks follow a chosen symbol anywhere in a file, even as it changes. Create symbol blocks to keep your docs from getting stale.',
        image: {
            light: 'https://storage.googleapis.com/sourcegraph-assets/notebooks/notebooks_symbol_block_light.png',
            dark: 'https://storage.googleapis.com/sourcegraph-assets/notebooks/notebooks_symbol_block_dark.png',
            alt: 'Notebook symbol block',
        },
    },
    {
        title: 'The command palette',
        description:
            'Use slash commands to choose from the available block Notebook block types. Markdown, file, symbol, and search query blocks are supported.',
        image: {
            light: 'https://storage.googleapis.com/sourcegraph-assets/notebooks/notebooks_command_palette_light.png',
            dark: 'https://storage.googleapis.com/sourcegraph-assets/notebooks/notebooks_command_palette_dark.png',
            alt: 'Notebooks command pallete',
        },
    },
    {
        title: 'Share Notebooks with your team or company',
        description:
            "Notebooks are private by default, but you can share them with your team (if you're using Sourcegraph organizations) or with your company.",
        image: {
            light: 'https://storage.googleapis.com/sourcegraph-assets/notebooks/notebooks_sharing_light.png',
            dark: 'https://storage.googleapis.com/sourcegraph-assets/notebooks/notebooks_sharing_dark.png',
            alt: 'Notebooks sharing dialog',
        },
    },
]

export const NotebooksGettingStartedTab: React.FunctionComponent<
    React.PropsWithChildren<NotebooksGettingStartedTabProps>
> = ({ telemetryService }) => {
    const { t } = useTranslation('notebooks/listPage')

    useEffect(() => {
        // No V2 telemetry required, as this is duplicative with the view event logged in NotebooksListPage.tsx.
        telemetryService.log('NotebooksGettingStartedTabViewed')
    }, [telemetryService])

    const [, setHasSeenGettingStartedTab] = useTemporarySetting('search.notebooks.gettingStartedTabSeen', false)

    useEffect(() => {
        setHasSeenGettingStartedTab(true)
    }, [setHasSeenGettingStartedTab])

    const canAutoplay = !useReducedMotion()
    const videoAutoplayAttributes = canAutoplay ? { autoPlay: true, loop: true, controls: false } : { controls: true }

    const isLightTheme = useIsLightTheme()

    return (
        <>
            <Container className="mb-4">
                <div className={classNames(styles.row, 'row')}>
                    <div className="col-12 col-md-6">
                        <video
                            key={`notebooks_overview_video_${isLightTheme}`}
                            className="w-100 h-auto shadow"
                            muted={true}
                            playsInline={true}
                            {...videoAutoplayAttributes}
                        >
                            <source
                                type="video/webm"
                                src={`https://storage.googleapis.com/sourcegraph-assets/notebooks/notebooks_overview_v3_${
                                    isLightTheme ? 'light' : 'dark'
                                }.webm`}
                            />
                            <source
                                type="video/mp4"
                                src={`https://storage.googleapis.com/sourcegraph-assets/notebooks/notebooks_overview_v3_${
                                    isLightTheme ? 'light' : 'dark'
                                }.mp4`}
                            />
                        </video>
                    </div>
                    <div className="col-12 col-md-6">
                        <H2>{t('create-living-documentation-effortlessly')}</H2>
                        <Text>{t('notebooks-creating-sharing-knowledge')}</Text>
                        <H3>{t('use-notebooks-to')}</H3>
                        <ul className={classNames(styles.narrowList, 'mb-0')}>
                            <li className="mb-1">{t('create-focused-onboarding-docs')}</li>
                            <li className="mb-1">{t('prepare-pull-request-walkthroughs')}</li>
                            <li className="mb-1">{t('document-complex-systems')}</li>
                            <li className="mb-1">{t('track-symbol-definitions')}</li>
                            <li className="mb-1">
                                <Trans
                                    i18nKey="embed-current-code-in-docs"
                                    components={{
                                        '0': (
                                            <Link
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                to="/help/notebooks/notebook-embedding"
                                            />
                                        ),
                                    }}
                                />
                            </li>
                        </ul>
                    </div>
                </div>
            </Container>

            <H3>{t('example-notebooks')}</H3>
            <div className={classNames(styles.row, 'row', 'mb-4')}>
                <div className="col-12 col-md-6">
                    <Container>
                        <Link
                            target="_blank"
                            rel="noopener noreferrer"
                            to="https://sourcegraph.com/notebooks/Tm90ZWJvb2s6MQ=="
                        >
                            {t('find-log4j-dependencies')}
                            <Icon aria-hidden={true} svgPath={mdiOpenInNew} />
                        </Link>
                        <div className="mt-2">{t('find-log4j-dependencies-across-code')}</div>
                    </Container>
                </div>
                <div className="col-12 col-md-6">
                    <Container>
                        <Link
                            target="_blank"
                            rel="noopener noreferrer"
                            to="https://sourcegraph.com/notebooks/Tm90ZWJvb2s6MTM="
                        >
                            {t('learn-sourcegraph-find-code')}
                            <Icon aria-hidden={true} svgPath={mdiOpenInNew} />
                        </Link>
                        <div className="mt-2">{t('learn-find-reference-code')}</div>
                    </Container>
                </div>
            </div>
            <H3>{t('functionality')}</H3>
            <div className={classNames(styles.row, 'row', 'mb-4')}>
                {functionalityPanels.map(panel => (
                    <div key={panel.title} className="col-12 col-md-4">
                        <Container>
                            <img
                                className="w-100"
                                src={isLightTheme ? panel.image.light : panel.image.dark}
                                alt={panel.image.alt}
                            />
                            <div className="my-2">
                                <strong>{panel.title}</strong>
                            </div>
                            <Text>{panel.description}</Text>
                        </Container>
                    </div>
                ))}
            </div>
            <div className={classNames(styles.row, 'row', 'mb-4')}>
                <div className="col-12 col-md-6">
                    <div className="mb-2">
                        <strong>{t('ready-to-get-started')}</strong>
                    </div>
                    <div className="mb-2">{t('notebooks-for-onboarding-documentation')}</div>
                    <Link to={PageRoutes.NotebookCreate}>{t('create-a-notebook')}</Link>
                </div>
                <div className="col-12 col-md-6">
                    <div className="mb-2">
                        <strong>{t('learn-more-about-notebooks')}</strong>
                    </div>
                    <div className="mb-2">{t('read-in-depth-material-notebooks-features')}</div>
                    <Link target="_blank" rel="noopener noreferrer" to="/help/notebooks">
                        {t('documentation')}
                        <Icon aria-hidden={true} svgPath={mdiOpenInNew} />
                    </Link>
                </div>
            </div>
        </>
    )
}
