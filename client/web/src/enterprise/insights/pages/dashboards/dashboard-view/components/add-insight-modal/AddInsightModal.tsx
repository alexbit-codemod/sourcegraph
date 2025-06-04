import { type FC, type ReactElement, type ReactNode, useContext, useState, useMemo, type FormEvent } from 'react'

import { useApolloClient } from '@apollo/client'
import { mdiClose } from '@mdi/js'
import { useTranslation, Trans } from 'react-i18next'
import { lastValueFrom } from 'rxjs'

import { isErrorLike, pluralize } from '@sourcegraph/common'
import {
    Button,
    Modal,
    H2,
    Icon,
    ErrorAlert,
    MultiCombobox,
    MultiComboboxInput,
    MultiComboboxList,
    MultiComboboxOption,
    MultiComboboxOptionText,
    Link,
} from '@sourcegraph/wildcard'

import { LoaderButton } from '../../../../../../../components/LoaderButton'
import type { GroupByField } from '../../../../../../../graphql-operations'
import { CodeInsightsBackendContext, type CustomInsightDashboard } from '../../../../../core'
import { encodeDashboardIdQueryParam } from '../../../../../routers.constant'

import { getCachedDashboardInsights, useInsightSuggestions } from './query'
import { getInsightId, getInsightTitle, type InsightSuggestion, InsightType } from './types'

import styles from './AddInsightModal.module.scss'

export interface AddInsightModalProps {
    dashboard: CustomInsightDashboard
    onClose: () => void
}

export const AddInsightModal: FC<AddInsightModalProps> = props => {
    const { t } = useTranslation('enterprise/insights/pages/dashboards/dashboard-view/components/add-insight-modal')

    const { dashboard, onClose } = props

    const client = useApolloClient()
    const { assignInsightsToDashboard } = useContext(CodeInsightsBackendContext)

    const [search, setSearch] = useState('')
    const [submittingOrError, setSubmittingOrError] = useState<boolean | Error>(false)
    const [dashboardInsights, setDashboardInsights] = useState(() => getCachedDashboardInsights(client, dashboard.id))

    const excludeIds = useMemo(() => dashboardInsights.map(insight => insight.id), [dashboardInsights])
    const { connection, loading, fetchMore } = useInsightSuggestions({ search, excludeIds })

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        setSubmittingOrError(true)

        try {
            const prevInsights = getCachedDashboardInsights(client, dashboard.id)

            await lastValueFrom(
                assignInsightsToDashboard({
                    id: dashboard.id,
                    prevInsightIds: prevInsights.map(insight => insight.id),
                    nextInsightIds: dashboardInsights.map(insight => insight.id),
                }),
                { defaultValue: undefined }
            )
            setSubmittingOrError(false)
            onClose()
        } catch (error) {
            setSubmittingOrError(error)
        }
    }

    return (
        <Modal
            position="center"
            aria-label="Add insights to dashboard modal"
            className={styles.modal}
            onDismiss={onClose}
        >
            <header className={styles.header}>
                <H2 className="m-0 font-weight-normal">
                    <Trans
                        i18nKey="add-insight-to-dashboard-title"
                        values={{ dashboardTitle: <>{dashboard.title}</> }}
                        components={{ '0': <q /> }}
                    />
                </H2>

                <Button variant="icon" className={styles.closeButton} aria-label="Close" onClick={onClose}>
                    <Icon aria-hidden={true} svgPath={mdiClose} />
                </Button>
            </header>

            {/* eslint-disable-next-line react/forbid-elements */}
            <form className={styles.form} onSubmit={handleSubmit}>
                <MultiCombobox
                    selectedItems={dashboardInsights}
                    getItemKey={getInsightId}
                    getItemName={getInsightTitle}
                    className={styles.picker}
                    onSelectedItemsChange={setDashboardInsights}
                >
                    <MultiComboboxInput
                        value={search}
                        autoFocus={true}
                        placeholder={t('search-insights-placeholder')}
                        status={loading ? 'loading' : 'initial'}
                        onChange={event => setSearch(event.target.value)}
                    />

                    <small className={styles.description}>
                        <span>
                            <Trans
                                i18nKey="create-new-insight-link"
                                components={{
                                    '0': <Link to={encodeDashboardIdQueryParam('/insights/create', dashboard.id)} />,
                                }}
                            />
                        </span>
                        {connection && (
                            <span>
                                {plural('result', connection.nodes.length)}
                                {connection.totalCount && (
                                    <>
                                        {t('out-of-insights')}
                                        {plural('total', connection.totalCount)}
                                    </>
                                )}
                            </span>
                        )}
                    </small>

                    <MultiComboboxList
                        items={connection?.nodes ?? []}
                        renderEmptyList={true}
                        className={styles.suggestionsList}
                    >
                        {items => {
                            const { t } = useTranslation(
                                'enterprise/insights/pages/dashboards/dashboard-view/components/add-insight-modal'
                            )

                            return (
                                <>
                                    {items.map((item, index) => (
                                        <InsightSuggestionCard key={getInsightId(item)} item={item} index={index} />
                                    ))}
                                    {items.length === 0 && (
                                        <span className={styles.zeroStateMessage}>
                                            {loading ? 'Loading...' : 'No insights found'}
                                        </span>
                                    )}
                                    {connection?.pageInfo?.hasNextPage && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            outline={true}
                                            className={styles.loadMore}
                                            onClick={fetchMore}
                                        >
                                            {t('load-more-insights')}
                                        </Button>
                                    )}
                                </>
                            )
                        }}
                    </MultiComboboxList>
                </MultiCombobox>

                {isErrorLike(submittingOrError) && <ErrorAlert className="mt-3" error={submittingOrError} />}

                <footer className={styles.footer}>
                    <span className={styles.keyboardExplanation}>
                        <Trans i18nKey="navigate-results-instructions" components={{ '0': <kbd />, '1': <kbd /> }} />
                    </span>

                    <Button
                        type="button"
                        className={styles.cancelAction}
                        variant="secondary"
                        outline={true}
                        onClick={onClose}
                    >
                        {t('cancel-action')}
                    </Button>

                    <LoaderButton
                        alwaysShowLabel={true}
                        loading={!isErrorLike(submittingOrError) && submittingOrError}
                        label={!isErrorLike(submittingOrError) && submittingOrError ? 'Saving' : 'Save'}
                        type="submit"
                        disabled={!isErrorLike(submittingOrError) && submittingOrError}
                        variant="primary"
                    />
                </footer>
            </form>
        </Modal>
    )
}

function plural(what: string, count: number): string {
    return `${count.toLocaleString()} ${pluralize(what, count)}`
}

interface InsightSuggestionCardProps {
    item: InsightSuggestion
    index: number
}

function InsightSuggestionCard(props: InsightSuggestionCardProps): ReactElement {
    const { t } = useTranslation('enterprise/insights/pages/dashboards/dashboard-view/components/add-insight-modal')

    const { item, index } = props

    return (
        <MultiComboboxOption value={getInsightTitle(item)} index={index} className={styles.suggestionCard}>
            <span>
                <MultiComboboxOptionText />
            </span>
            <small className={styles.suggestionCardDescription}>
                {item.type}
                {t('insight-label')}
                {getInsightDetails(item)}
            </small>
        </MultiComboboxOption>
    )
}

function getInsightDetails(insight: InsightSuggestion): ReactNode {
    switch (insight.type) {
        case InsightType.Detect: {
            return insight.queries.join(', ')
        }
        case InsightType.DetectAndTrack: {
            return insight.query
        }
        case InsightType.Compute: {
            return `${insight.query}, grouped by ${formatGroupBy(insight.groupBy)}`
        }
        case InsightType.LanguageStats: {
            return ''
        }
    }
}

const formatGroupBy = (groupBy: GroupByField): string => {
    const str = groupBy.toString()
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
