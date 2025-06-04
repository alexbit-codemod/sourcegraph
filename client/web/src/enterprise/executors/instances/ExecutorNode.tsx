import React, { type FunctionComponent } from 'react'

import { mdiCheckboxBlankCircle } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { Timestamp } from '@sourcegraph/branded/src/components/Timestamp'
import { Badge, H4, Icon, Tooltip } from '@sourcegraph/wildcard'

import { Collapsible } from '../../../components/Collapsible'
import type { ExecutorFields } from '../../../graphql-operations'

import { ExecutorCompatibilityAlert } from './ExecutorCompatibilityAlert'

import styles from './ExecutorNode.module.scss'

export interface ExecutorNodeProps {
    node: ExecutorFields
}

export const ExecutorNode: FunctionComponent<React.PropsWithChildren<ExecutorNodeProps>> = ({ node }) => {
    const { t } = useTranslation('enterprise/executors/instances')

    return (
        <li className={classNames(styles.node, 'list-group-item')}>
            <Collapsible
                wholeTitleClickable={false}
                titleClassName="flex-grow-1"
                title={
                    <div className="d-flex justify-content-between">
                        <div>
                            <H4 className="mb-0">
                                {node.active ? (
                                    <Icon
                                        aria-hidden={true}
                                        className="text-success mr-2"
                                        svgPath={mdiCheckboxBlankCircle}
                                    />
                                ) : (
                                    <Tooltip content="This executor missed at least three heartbeats.">
                                        <Icon
                                            aria-label="This executor missed at least three heartbeats."
                                            className="text-warning mr-2"
                                            svgPath={mdiCheckboxBlankCircle}
                                        />
                                    </Tooltip>
                                )}
                                {node.hostname}{' '}
                                {node.queueName !== null && (
                                    <Badge
                                        variant="secondary"
                                        tooltip={`The executor is configured to pull data from the queue "${node.queueName}"`}
                                    >
                                        {node.queueName}
                                    </Badge>
                                )}
                                {(node.queueNames || [])?.map((queue, index, arr) => (
                                    <Badge
                                        key={queue}
                                        variant="secondary"
                                        tooltip={`The executor is configured to pull data from the queue "${queue}"`}
                                        className={arr.length - 1 !== index ? 'mr-1' : ''}
                                    >
                                        {queue}
                                    </Badge>
                                ))}
                            </H4>
                        </div>
                        <span>
                            {t('last-seen')}
                            <Timestamp date={node.lastSeenAt} />
                        </span>
                    </div>
                }
            >
                <dl className="mt-2 mb-0">
                    <div className="d-flex w-100">
                        <div className="flex-grow-1">
                            <dt>{t('operating-system')}</dt>
                            <dd>
                                <TelemetryData data={node.os} />
                            </dd>

                            <dt>{t('architecture')}</dt>
                            <dd>
                                <TelemetryData data={node.architecture} />
                            </dd>

                            <dt>{t('executor-version')}</dt>
                            <dd>
                                <TelemetryData data={node.executorVersion} />
                            </dd>

                            <dt>{t('docker-version')}</dt>
                            <dd>
                                <TelemetryData data={node.dockerVersion} />
                            </dd>
                        </div>
                        <div className="flex-grow-1">
                            <dt>{t('git-version')}</dt>
                            <dd>
                                <TelemetryData data={node.gitVersion} />
                            </dd>

                            <dt>{t('ignite-version')}</dt>
                            <dd>
                                <TelemetryData data={node.igniteVersion} />
                            </dd>

                            <dt>{t('src-cli-version')}</dt>
                            <dd>
                                <TelemetryData data={node.srcCliVersion} />
                            </dd>

                            <dt>{t('first-seen-at')}</dt>
                            <dd>
                                <Timestamp date={node.firstSeenAt} />
                            </dd>
                        </div>
                    </div>
                </dl>
            </Collapsible>

            {node.compatibility && (
                <ExecutorCompatibilityAlert hostname={node.hostname} compatibility={node.compatibility} />
            )}
        </li>
    )
}

const TelemetryData: React.FunctionComponent<React.PropsWithChildren<{ data: string }>> = ({ data }) => {
    const { t } = useTranslation('enterprise/executors/instances')

    if (data) {
        return <>{data}</>
    }
    return <>{t('not-available')}</>
}
