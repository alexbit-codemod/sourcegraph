import React, { useCallback } from 'react'

import { mdiPlus } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import type { AuthenticatedUser } from '@sourcegraph/shared/src/auth'
import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { EVENT_LOGGER } from '@sourcegraph/shared/src/telemetry/web/eventLogger'
import { useIsLightTheme } from '@sourcegraph/shared/src/theme'
import { Button, Card, CardBody, H2, H3, H4, Icon, Link, Text } from '@sourcegraph/wildcard'

import styles from './CodeMonitoringGettingStarted.module.scss'

interface CodeMonitoringGettingStartedProps extends TelemetryV2Props {
    authenticatedUser: AuthenticatedUser | null
}

interface ExampleCodeMonitor {
    title: string
    description: string
    monitorName: string
    monitorQuery: string
}

const exampleCodeMonitors: ExampleCodeMonitor[] = [
    {
        title: 'Uses of a deprecated method',
        description:
            'Get notified when a deprecated method is added or removed. This example uses leftPad in JavaScript files.',
        monitorName: 'Uses of leftPad in JavaScript',
        monitorQuery: 'lang:JavaScript require(("|\')left-pad("|\')) patternType:regexp type:diff ',
    },
    {
        title: 'New library usage',
        description:
            'After you add a new library, you can watch your codebase for its usage and get notified when it’s imported or certain functions from it are used. This example uses faker in TypeScript.',
        monitorName: 'New uses of faker in TypeScript',
        monitorQuery:
            'lang:TypeScript import faker from "faker" OR import faker from \'faker\' type:diff select:commit.diff.added ',
    },
    {
        title: 'Bad coding patterns',
        description:
            'Get notified when someone uses a pattern that your team is trying to avoid. This example uses React class components in JavaScript.',
        monitorName: 'New React class components in JavaScript',
        monitorQuery:
            'lang:JavaScript class \\w extends React.Component type:diff patternType:regexp select:commit.diff.added ',
    },
    {
        title: 'IP address range',
        description:
            'Detect the usage of banned or invalid IP addresses in your code. This example uses local IP address in the 192.168.1.x range.',
        monitorName: 'New uses of local IP addresses',
        monitorQuery: '^192\\.168\\.1\\.([1-9]|[1-9]d|100)$ type:diff select:commit.diff.added patternType:regexp ',
    },
]

const createCodeMonitorUrl = (example: ExampleCodeMonitor): string => {
    const searchParameters = new URLSearchParams()
    searchParameters.set('trigger-query', example.monitorQuery)
    searchParameters.set('description', example.monitorName)
    return `/code-monitoring/new?${searchParameters.toString()}`
}

export const CodeMonitoringGettingStarted: React.FunctionComponent<
    React.PropsWithChildren<CodeMonitoringGettingStartedProps>
> = ({ authenticatedUser, telemetryRecorder }) => {
    const { t } = useTranslation('enterprise/code-monitoring')

    const isLightTheme = useIsLightTheme()
    const assetsRoot = window.context?.assetsRoot || ''

    const logExampleMonitorClicked = useCallback(() => {
        EVENT_LOGGER.log('CodeMonitoringExampleMonitorClicked')
        telemetryRecorder.recordEvent('codeMonitor.example', 'click')
    }, [telemetryRecorder])

    return (
        <div>
            <Card className={classNames('mb-4 flex-column flex-lg-row', styles.hero)}>
                <img
                    src={`${assetsRoot}/img/codemonitoring-illustration-${isLightTheme ? 'light' : 'dark'}.svg`}
                    alt={t('code-monitor-deprecated-library-alert')}
                    className={classNames('mr-lg-5', styles.heroImage)}
                />
                <div className="align-self-center">
                    <H2 className={classNames('mb-3', styles.heading)}>{t('proactive-codebase-monitoring')}</H2>
                    <Text className={classNames('mb-4')}>{t('automatic-code-change-tracking')}</Text>

                    <H3>{t('common-use-cases')}</H3>
                    <ul>
                        <li>{t('bad-patterns-identification')}</li>
                        <li>{t('deprecated-library-identification')}</li>
                    </ul>
                    {authenticatedUser && (
                        <Button to="/code-monitoring/new" className={styles.createButton} variant="primary" as={Link}>
                            <Icon aria-hidden={true} className="mr-2" svgPath={mdiPlus} />
                            {t('create-code-monitor')}
                        </Button>
                    )}
                </div>
            </Card>

            <div>
                <H3 className="mb-3">{t('example-code-monitors')}</H3>
                <div className={classNames('mb-3', styles.startingPointsContainer)}>
                    {exampleCodeMonitors.map(monitor => {
                        const { t } = useTranslation('enterprise/code-monitoring')

                        return (
                            <div className={styles.startingPoint} key={monitor.title}>
                                <Card className="h-100">
                                    <CardBody className="d-flex flex-column">
                                        <H3>{monitor.title}</H3>
                                        <Text className="text-muted flex-grow-1">{monitor.description}</Text>
                                        <Link to={createCodeMonitorUrl(monitor)} onClick={logExampleMonitorClicked}>
                                            {t('copy-monitor')}
                                        </Link>
                                    </CardBody>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="mt-5 px-0">
                <div className="row">
                    <div className="col-4">
                        <div>
                            <H4>{t('get-started-with-monitoring')}</H4>
                            <Text className="text-muted">{t('monitor-code-trigger-actions')}</Text>
                            <Link to="/help/code_monitoring" className="link">
                                {t('code-monitoring-documentation')}
                            </Link>
                        </div>
                    </div>
                    <div className="col-4">
                        <div>
                            <H4>{t('starting-points-ideas')}</H4>
                            <Text className="text-muted">{t('useful-code-monitor-examples')}</Text>
                            <Link to="/help/code_monitoring/how-tos/starting_points" className="link">
                                {t('explore-starting-points')}
                            </Link>
                        </div>
                    </div>
                    <div className="col-4">
                        <div>
                            <H4>{t('questions-and-feedback')}</H4>
                            <Text className="text-muted">{t('share-feedback-on-monitoring')}</Text>
                            <Link to="mailto:feedback@sourcegraph.com" className="link">
                                {t('share-your-thoughts')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
