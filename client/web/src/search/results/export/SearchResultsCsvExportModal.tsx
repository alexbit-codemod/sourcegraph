import React, { useCallback, useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { type ErrorLike, isErrorLike, logger } from '@sourcegraph/common'
import type { PlatformContext } from '@sourcegraph/shared/src/platform/context'
import { FilterKind, findFilter } from '@sourcegraph/shared/src/search/query/query'
import type { AggregateStreamingSearchResults, StreamSearchOptions } from '@sourcegraph/shared/src/search/stream'
import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { Alert, Button, Code, H3, Modal, Text } from '@sourcegraph/wildcard'

import { LoaderButton } from '../../../components/LoaderButton'
import { useFeatureFlag } from '../../../featureFlags/useFeatureFlag'

import { downloadSearchResults, EXPORT_RESULT_DISPLAY_LIMIT } from './searchResultsExport'

interface SearchResultsCsvExportModalProps
    extends Pick<PlatformContext, 'sourcegraphURL'>,
        TelemetryProps,
        TelemetryV2Props {
    query?: string
    options: StreamSearchOptions
    results?: AggregateStreamingSearchResults
    onClose: () => void
}

const MODAL_LABEL_ID = 'search-results-export-csv-modal-id'

export const SearchResultsCsvExportModal: React.FunctionComponent<SearchResultsCsvExportModalProps> = ({
    telemetryService,
    sourcegraphURL,
    query = '',
    options,
    results,
    onClose,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('search/results/export')

    const searchCompleted = results?.state === 'complete' || results?.state === 'error' // Allow exporting results even if there was an error

    const shouldRerunSearch = useMemo(
        () => searchCompleted && results?.progress.skipped.some(skipped => skipped.reason === 'display'),
        [results?.progress.skipped, searchCompleted]
    )

    const noTypeFilter = useMemo(
        () => !findFilter(query, 'type', FilterKind.Global) && !findFilter(query, 'select', FilterKind.Global),
        [query]
    )

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ErrorLike | undefined>()

    const [enableRepositoryMetadata] = useFeatureFlag('repository-metadata', true)

    const downloadResults = useCallback(() => {
        if (!searchCompleted) {
            return
        }

        if (query.includes('select:file.owners')) {
            telemetryService.log('searchResults:ownershipCsv:exported')
            telemetryRecorder.recordEvent('search.results.ownershipCSV', 'export')
        }

        setLoading(true)
        setError(undefined)

        downloadSearchResults(
            sourcegraphURL,
            query,
            { ...options, enableRepositoryMetadata },
            results,
            shouldRerunSearch,
            telemetryRecorder
        )
            .then(() => {
                onClose()
            })
            .catch(error => {
                logger.error(error)
                if (isErrorLike(error)) {
                    setError(error)
                } else {
                    setError(new Error('An unknown error occurred when trying to export your search results.'))
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }, [
        searchCompleted,
        query,
        sourcegraphURL,
        options,
        enableRepositoryMetadata,
        results,
        shouldRerunSearch,
        telemetryService,
        telemetryRecorder,
        onClose,
    ])

    return (
        <Modal aria-labelledby={MODAL_LABEL_ID}>
            <H3 id={MODAL_LABEL_ID}>{t('export-search-results')}</H3>

            <Text>{t('export-search-results-csv')}</Text>

            {!searchCompleted && <Alert variant="danger">{t('search-not-completed')}</Alert>}

            {shouldRerunSearch && (
                <Alert variant="warning">
                    {t('search-reached-maximum-results')}
                    {EXPORT_RESULT_DISPLAY_LIMIT.toLocaleString('en-US')}
                    {t('results-exported-limit')}
                </Alert>
            )}

            {noTypeFilter && (
                <Alert variant="warning">
                    {t('search-no-global-type')}
                    <Code>{t('search-type')}</Code>
                    {t('search-or')}
                    <Code>{t('search-select')}</Code>
                    {t('exported-results-same-type')}
                </Alert>
            )}

            <div className="d-flex justify-content-end">
                <Button disabled={loading} onClick={onClose} variant="secondary" className="mr-2">
                    {t('cancel-export')}
                </Button>
                <LoaderButton
                    label={t('export-button')}
                    onClick={downloadResults}
                    loading={loading}
                    disabled={!searchCompleted || loading}
                    variant="primary"
                />
            </div>

            {error && (
                <Alert variant="danger" className="mt-2">
                    {error.message}
                </Alert>
            )}
        </Modal>
    )
}
