import { type FunctionComponent, useCallback, useEffect } from 'react'

import { mdiTrashCan } from '@mdi/js'
import classNames from 'classnames'
import { format, formatDistance, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { Timestamp } from '@sourcegraph/branded/src/components/Timestamp'
import { useMutation } from '@sourcegraph/http-client'
import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps, TelemetryService } from '@sourcegraph/shared/src/telemetry/telemetryService'
import {
    Badge,
    Button,
    Code,
    Container,
    ErrorAlert,
    H4,
    Icon,
    LoadingSpinner,
    PageHeader,
    Text,
} from '@sourcegraph/wildcard'

import { Collapsible } from '../../../../components/Collapsible'
import type {
    BumpDerivativeGraphKeyResult,
    BumpDerivativeGraphKeyVariables,
    DeleteRankingProgressResult,
    DeleteRankingProgressVariables,
} from '../../../../graphql-operations'

import {
    BUMP_DERIVATIVE_GRAPH_KEY,
    DELETE_RANKING_PROGRESS,
    useRankingSummary as defaultUseRankingSummary,
} from './backend'

import styles from './CodeIntelRankingPage.module.scss'

export interface CodeIntelRankingPageProps extends TelemetryProps, TelemetryV2Props {
    useRankingSummary?: typeof defaultUseRankingSummary
    telemetryService: TelemetryService
}

export const CodeIntelRankingPage: FunctionComponent<CodeIntelRankingPageProps> = ({
    useRankingSummary = defaultUseRankingSummary,
    telemetryService,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('enterprise/codeintel/ranking/pages')

    useEffect(() => {
        telemetryService.logViewEvent('CodeIntelRankingPage')
        telemetryRecorder.recordEvent('admin.codeIntel.ranking', 'view')
    }, [telemetryService, telemetryRecorder])

    const { data, loading, error, refetch } = useRankingSummary({})

    const [bumpDerivativeGraphKey, { loading: bumping }] = useMutation<
        BumpDerivativeGraphKeyResult,
        BumpDerivativeGraphKeyVariables
    >(BUMP_DERIVATIVE_GRAPH_KEY)

    const [deleteProgressEntry, { loading: deleting }] = useMutation<
        DeleteRankingProgressResult,
        DeleteRankingProgressVariables
    >(DELETE_RANKING_PROGRESS)

    const onEnqueue = useCallback(async () => {
        try {
            await bumpDerivativeGraphKey()
        } finally {
            window.alert('A new job will begin on the next invocation.')
        }
    }, [bumpDerivativeGraphKey])

    const onDelete = useCallback(
        async (graphKey: string) => {
            if (!window.confirm('Delete progress record?')) {
                return
            }

            try {
                await deleteProgressEntry({ variables: { graphKey } })
            } finally {
                await refetch()
            }
        },
        [deleteProgressEntry, refetch]
    )

    if (loading) {
        return <LoadingSpinner />
    }

    if (error) {
        return <ErrorAlert prefix="Failed to load code intelligence summary for repository" error={error} />
    }

    return (
        <>
            <PageHeader
                headingElement="h2"
                path={[
                    {
                        text: <>{t('ranking-calculation-history')}</>,
                    },
                ]}
                description={t('view-history-ranking-calculation')}
                className="mb-3"
                actions={
                    <Button onClick={() => onEnqueue()} disabled={bumping || deleting} variant="secondary">
                        {t('start-new-ranking-job')}
                    </Button>
                }
            />

            {data?.rankingSummary && (
                <>
                    {data.rankingSummary.nextJobStartsAt && (
                        <Text size="small" className="text-right">
                            {t('next-job-scheduled')}
                            {parseISO(data.rankingSummary.nextJobStartsAt).getTime() - Date.now() <= 60 * 1000 ? (
                                <>{t('shortly')}</>
                            ) : (
                                <Timestamp date={data.rankingSummary.nextJobStartsAt} />
                            )}
                            .
                        </Text>
                    )}

                    <Container className="mb-3">
                        <div className={styles.summary}>
                            <span className={styles.summaryItem}>
                                <div
                                    className={classNames(
                                        styles.summaryNumber,
                                        data.rankingSummary.numTargetIndexes === 0
                                            ? 'text-muted'
                                            : data.rankingSummary.numExportedIndexes !==
                                              data.rankingSummary.numTargetIndexes
                                            ? 'text-warning'
                                            : 'text-success'
                                    )}
                                >
                                    {data.rankingSummary.numExportedIndexes}
                                    {t('of')}
                                    {data.rankingSummary.numTargetIndexes}
                                </div>
                                <div className={styles.summaryLabel}>{t('scip-indexes-exported')}</div>
                            </span>

                            <span className={styles.summaryItem}>
                                <div
                                    className={classNames(
                                        styles.summaryNumber,
                                        data.rankingSummary.numTargetIndexes === 0
                                            ? 'text-muted'
                                            : data.rankingSummary.numRepositoriesWithoutCurrentRanks > 0
                                            ? 'text-warning'
                                            : 'text-success'
                                    )}
                                >
                                    {data.rankingSummary.numRepositoriesWithoutCurrentRanks}
                                </div>
                                <div className={classNames(styles.summaryLabel, styles.summaryItemExtended)}>
                                    {t('repositories-must-be-indexed')}
                                </div>
                            </span>
                        </div>
                    </Container>

                    {data.rankingSummary.rankingSummary.length === 0 ? (
                        <Container>
                            <>{t('no-data')}</>
                        </Container>
                    ) : (
                        data.rankingSummary.rankingSummary.map((summary, index) => (
                            <Summary
                                key={summary.graphKey}
                                summary={summary}
                                derivativeGraphKey={data.rankingSummary.derivativeGraphKey}
                                onDelete={index > 0 ? () => onDelete(summary.graphKey) : undefined}
                                className="mb-3"
                            />
                        ))
                    )}
                </>
            )}
        </>
    )
}

interface Summary {
    graphKey: string
    visibleToZoekt: boolean
    pathMapperProgress: Progress
    referenceMapperProgress: Progress
    reducerProgress: Progress | null
}

interface Progress {
    startedAt: string
    completedAt: string | null
    processed: number
    total: number
}

interface SummaryProps {
    summary: Summary
    derivativeGraphKey: string | null
    onDelete?: () => Promise<void>
    className?: string
}

const Summary: FunctionComponent<SummaryProps> = ({ summary, derivativeGraphKey, onDelete, className = '' }) => {
    const { t } = useTranslation('enterprise/codeintel/ranking/pages')

    return (
        <Container className={className}>
            <Collapsible
                title={
                    <>
                        {t('ranking-job')}
                        <Code>{summary.graphKey}</Code>
                        {summary.visibleToZoekt ? (
                            <Badge variant="primary" className="ml-4">
                                {t('visible')}
                            </Badge>
                        ) : (
                            summary.graphKey === derivativeGraphKey && (
                                <Badge variant="info" className="ml-4">
                                    {t('calculating')}
                                </Badge>
                            )
                        )}
                    </>
                }
                titleAtStart={true}
                defaultExpanded={summary.visibleToZoekt || summary.graphKey === derivativeGraphKey}
            >
                <div className="pt-4">
                    <Progress
                        title={t('path-mapper')}
                        subtitle="Reads the paths of SCIP indexes exported for ranking and produce path/zero-count pairs consumed by the ranking phase."
                        progress={summary.pathMapperProgress}
                    />

                    <Progress
                        title={t('reference-count-mapper')}
                        subtitle="Reads the symbol references of SCIP indexes exported for ranking, join them to exported definitions, and produce definition path/count pairs consumed by the ranking phase."
                        progress={summary.referenceMapperProgress}
                        className="mt-4"
                    />

                    {summary.reducerProgress && (
                        <Progress
                            title={t('reference-count-reducer')}
                            subtitle="Sums the references for each definition path produced by the mapping phases and groups them by repository."
                            progress={summary.reducerProgress}
                            className="mt-4"
                        />
                    )}

                    {onDelete && (
                        <Button variant="danger" className="p-2 mt-4" onClick={() => onDelete()}>
                            <Icon aria-hidden={true} svgPath={mdiTrashCan} />
                            {t('delete')}
                        </Button>
                    )}
                </div>
            </Collapsible>
        </Container>
    )
}

interface ProgressProps {
    title: string
    subtitle?: string
    progress: Progress
    className?: string
}

const Progress: FunctionComponent<ProgressProps> = ({ title, subtitle, progress, className }) => {
    const { t } = useTranslation('enterprise/codeintel/ranking/pages')

    return (
        <div>
            <div className={classNames(styles.tableContainer, className)}>
                <H4 className="m-0">{title}</H4>
                {subtitle && <Text size="small">{subtitle}</Text>}

                <div className={styles.row}>
                    <div>{t('queued-records')}</div>
                    <div>
                        {progress.total === 0 ? (
                            <>{t('no-records-to-process')}</>
                        ) : (
                            <>
                                {progress.processed}
                                {t('of-records-processed')}
                                {progress.total}
                                {t('progress')}
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.row}>
                    <div>{t('started')}</div>
                    <div>
                        {progress.total === 0
                            ? 100
                            : Math.floor((progress.processed * 100 * 100) / progress.total) / 100}
                        %
                    </div>
                </div>

                <div className={styles.row}>
                    <div>{t('completed')}</div>
                    <div>
                        {format(parseISO(progress.startedAt), 'MMM d y h:mm:ss a')} (
                        <Timestamp date={progress.startedAt} />)
                    </div>
                </div>

                {progress.completedAt && (
                    <div className={styles.row}>
                        <div>{t('duration')}</div>
                        <div>
                            {format(parseISO(progress.completedAt), 'MMM d y h:mm:ss a')} (
                            <Timestamp date={progress.completedAt} />)
                        </div>
                    </div>
                )}

                {progress.completedAt && (
                    <div className={styles.row}>
                        <div>{t('ran-for-duration')}</div>
                        <div>
                            {t('progress-duration', {
                                formatDistanceNewDateProgressCompletedAtNewDateProgressStartedAt: formatDistance(
                                    new Date(progress.completedAt),
                                    new Date(progress.startedAt)
                                ),
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
