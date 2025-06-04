import React, { useEffect, useMemo, useRef } from 'react'

import { json } from '@codemirror/lang-json'
import { foldGutter } from '@codemirror/language'
import { search, searchKeymap } from '@codemirror/search'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import { fromFetch } from 'rxjs/fetch'

import { checkOk } from '@sourcegraph/http-client'
import {
    defaultEditorTheme,
    editorHeight,
    jsonHighlighting,
    useCodeMirror,
} from '@sourcegraph/shared/src/components/CodeMirrorEditor'
import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { EVENT_LOGGER } from '@sourcegraph/shared/src/telemetry/web/eventLogger'
import { useIsLightTheme } from '@sourcegraph/shared/src/theme'
import { Container, H3, Link, LoadingSpinner, PageHeader, Text, useObservable } from '@sourcegraph/wildcard'

import { PageTitle } from '../components/PageTitle'

// This seems to be necessary to have properly rounded corners on
// the right side.
const theme = EditorView.theme({
    '.cm-scroller': {
        borderTopRightRadius: 'var(--border-radius)',
        borderBottomRightRadius: 'var(--border-radius)',
    },
})

interface Props extends TelemetryV2Props {}

/**
 * A page displaying information about telemetry pings for the site.
 */
export const SiteAdminPingsPage: React.FunctionComponent<React.PropsWithChildren<Props>> = ({ telemetryRecorder }) => {
    const { t } = useTranslation('site-admin')

    const isLightTheme = useIsLightTheme()
    const latestPing = useObservable(
        useMemo(() => fromFetch<{}>('/site-admin/pings/latest', { selector: response => checkOk(response).json() }), [])
    )
    useEffect(() => {
        EVENT_LOGGER.logViewEvent('SiteAdminPings')
        telemetryRecorder.recordEvent('admin.pings', 'view')
    }, [telemetryRecorder])

    const updatesDisabled = window.context.site['update.channel'] !== 'release'
    const jsonEditorContainerRef = useRef<HTMLDivElement | null>(null)
    const editorRef = useRef<EditorView | null>(null)

    useCodeMirror(
        editorRef,
        jsonEditorContainerRef,
        useMemo(() => JSON.stringify(latestPing, undefined, 4), [latestPing]),
        useMemo(
            () => [
                EditorView.darkTheme.of(!isLightTheme),
                EditorState.readOnly.of(true),
                json(),
                foldGutter(),
                editorHeight({ height: '300px' }),
                theme,
                defaultEditorTheme,
                jsonHighlighting,
                search({ top: true }),
                keymap.of(searchKeymap),
            ],
            [isLightTheme]
        )
    )

    return (
        <div className="site-admin-pings-page">
            <PageTitle title={t('pings-admin')} />
            <PageHeader
                path={[{ text: 'Pings' }]}
                headingElement="h2"
                description={<>{t('sourcegraph-ping-description')}</>}
                className="mb-3"
            />
            <Container>
                <H3>{t('most-recent-ping')}</H3>
                {latestPing === undefined ? (
                    <Text>
                        <LoadingSpinner />
                    </Text>
                ) : isEmpty(latestPing) ? (
                    <Text>{t('no-recent-ping-data')}</Text>
                ) : (
                    <div ref={jsonEditorContainerRef} className="mb-1 border rounded" />
                )}
                <H3>{t('critical-telemetry')}</H3>
                <Text>{t('critical-telemetry-description')}</Text>
                <ul>
                    <li>{t('random-site-identifier')}</li>
                    <li>{t('initial-site-installer-email-description')}</li>
                    <li>{t('external-instance-url')}</li>
                    <li>{t('sourcegraph-version-string')}</li>
                    <li>{t('dependency-versions')}</li>
                    <li>{t('deployment-type')}</li>
                    <li>{t('license-key')}</li>
                    <li>{t('current-monthly-users-count')}</li>
                    <li>{t('total-user-accounts-count')}</li>
                    <li>{t('code-insights-total-count')}</li>
                </ul>
                <H3>{t('other-telemetry')}</H3>
                <Text>{t('usage-performance-metrics-description')}</Text>
                <ul>
                    <li>{t('deployed-on-localhost')}</li>
                    <li>{t('authentication-provider-category')}</li>
                    <li>
                        {t('code-hosts-in-use')}
                        <ul>
                            <li>{t('code-hosts-versions')}</li>
                        </ul>
                    </li>
                    <li>{t('new-user-signup-allowed')}</li>
                    <li>{t('repository-added-ever')}</li>
                    <li>{t('code-search-executed-ever')}</li>
                    <li>{t('code-navigation-used-ever')}</li>
                    <li>{t('current-user-aggregate-counts')}</li>
                    <li>
                        {t('current-user-aggregate-counts-description')}
                        <ul>
                            <li>{t('using-code-host-integrations')}</li>
                            <li>{t('search-modes-used')}</li>
                            <li>{t('search-filters-used')}</li>
                        </ul>
                    </li>
                    <li>{t('search-query-latencies')}</li>
                    <li>
                        {t('aggregate-counts-description')}
                        <ul>
                            <li>{t('code-navigation-events')}</li>
                            <li>{t('searches-by-search-mode')}</li>
                            <li>{t('searches-by-search-filter')}</li>
                        </ul>
                    </li>
                    <li>
                        {t('code-navigation-usage-data')}
                        <ul>
                            <li>{t('repositories-without-lsif-index')}</li>
                            <li>{t('code-navigation-queries-per-week')}</li>
                            <li>{t('users-performing-code-navigation-queries')}</li>
                        </ul>
                    </li>
                    <li>
                        {t('batch-changes-usage-data')}
                        <ul>
                            <li>{t('batch-change-apply-page-views')}</li>
                            <li>{t('batch-change-details-page-views-after-creation')}</li>
                            <li>{t('batch-change-details-page-views-after-update')}</li>
                            <li>{t('created-changeset-specs-count')}</li>
                            <li>{t('created-batch-specs-count')}</li>
                            <li>{t('created-batch-changes-count')}</li>
                            <li>{t('closed-batch-changes-count')}</li>
                            <li>{t('changesets-created-by-batch-changes')}</li>
                            <li>{t('lines-added-deleted-in-changeset')}</li>
                            <li>{t('changesets-merged-by-batch-changes')}</li>
                            <li>{t('lines-added-deleted-in-merged-changeset')}</li>
                            <li>{t('changesets-manually-added-to-batch-change')}</li>
                            <li>{t('changesets-manually-added-and-merged')}</li>
                            <li>
                                {t('unique-monthly-users-aggregate-counts')}
                                <ul>
                                    <li>{t('contributed-to-batch-changes')}</li>
                                    <li>{t('only-viewed-batch-changes')}</li>
                                    <li>{t('performed-bulk-operation')}</li>
                                </ul>
                            </li>
                            <li>{t('weekly-batch-change-counts')}</li>
                            <li>{t('weekly-bulk-operations-count')}</li>
                            <li>{t('connected-executors-count')}</li>
                            <li>{t('cumulative-executor-runtime-monthly')}</li>
                            <li>{t('publish-bulk-operations-count')}</li>
                            <li>{t('bulk-operations-count-by-type')}</li>
                            <li>{t('changeset-distribution-by-source')}</li>
                            <li>{t('users-ran-job-on-executor-monthly')}</li>
                            <li>
                                {t('published-changesets-and-batch-changes-created')}
                                <ul>
                                    <li>{t('executor')}</li>
                                    <li>{t('local-src-cli')}</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li>
                        {t('monthly-aggregated-user-state-changes')}
                        <ul>
                            <li>{t('users-created-count')}</li>
                            <li>{t('users-deleted-count')}</li>
                            <li>{t('users-retained-count')}</li>
                            <li>{t('users-resurrected-count')}</li>
                            <li>{t('users-churned-count')}</li>
                        </ul>
                    </li>
                    <li>
                        {t('monthly-aggregated-access-requests-changes')}
                        <ul>
                            <li>{t('pending-access-requests-count')}</li>
                            <li>{t('approved-access-requests-count')}</li>
                            <li>{t('rejected-access-requests-count')}</li>
                        </ul>
                    </li>
                    <li>
                        {t('saved-searches-usage-data')}
                        <ul>
                            <li>{t('saved-searches-count')}</li>
                            <li>{t('users-using-saved-searches-count')}</li>
                            <li>{t('notifications-triggered-count')}</li>
                            <li>{t('notifications-clicked-count')}</li>
                            <li>{t('saved-search-views-count')}</li>
                        </ul>
                    </li>
                    <li>
                        {t('aggregated-repository-statistics')}
                        <ul>
                            <li>{t('total-git-repositories-size')}</li>
                            <li>{t('lines-of-code-in-text-search-index')}</li>
                        </ul>
                    </li>
                    <li>
                        {t('homepage-panel-engagement')}
                        <ul>
                            <li>{t('percentage-of-panel-clicks')}</li>
                            <li>{t('unique-users-engaging-with-panels-count')}</li>
                        </ul>
                    </li>
                    <li>{t('weekly-retention-rates')}</li>
                    <li>
                        {t('search-onboarding-engagement')}
                        <ul>
                            <li>{t('views-of-onboarding-tour')}</li>
                            <li>{t('views-of-onboarding-tour-steps')}</li>
                            <li>{t('tours-closed-count')}</li>
                        </ul>
                    </li>
                    <li>
                        {t('sourcegraph-extension-activation-statistics')}
                        <ul>
                            <li>{t('users-using-non-default-extensions-count')}</li>
                            <li>{t('average-activations-for-non-default-extensions')}</li>
                            <li>{t('users-using-non-default-extensions')}</li>
                            <li>{t('average-extensions-enabled-for-users')}</li>
                        </ul>
                    </li>
                    <li>
                        {t('code-insights-usage-data')}
                        <ul>
                            <li>
                                <Link to="/help/admin/pings#other-telemetry">{t('code-insights-pings-list')}</Link>
                            </li>
                        </ul>
                    </li>
                    <li>
                        {t('code-monitoring-usage-data')}
                        <ul>
                            <li>{t('views-of-code-monitoring-page')}</li>
                            <li>{t('views-of-create-code-monitor-page')}</li>
                            <li>{t('views-of-create-code-monitor-page-with-prepopulated-query')}</li>
                            <li>{t('views-of-create-code-monitor-page-without-prepopulated-query')}</li>
                            <li>{t('views-of-manage-code-monitor-page')}</li>
                            <li>{t('clicks-on-code-monitor-email-search-link')}</li>
                            <li>{t('clicks-on-example-monitors')}</li>
                            <li>{t('views-of-getting-started-page')}</li>
                            <li>{t('submissions-of-code-monitor-creation-form')}</li>
                            <li>{t('submissions-of-manage-code-monitor-form')}</li>
                            <li>{t('deletions-from-manage-code-monitor-form')}</li>
                            <li>{t('views-of-logs-page')}</li>
                            <li>{t('enabled-slack-webhook-email-actions-count')}</li>
                            <li>{t('unique-users-with-enabled-actions-count')}</li>
                            <li>{t('actions-triggered-count')}</li>
                            <li>{t('action-triggers-with-errors-count')}</li>
                            <li>{t('unique-users-with-triggered-actions-count')}</li>
                            <li>{t('search-executions-count')}</li>
                            <li>{t('errored-search-executions-count')}</li>
                            <li>{t('search-execution-percentiles')}</li>
                        </ul>
                    </li>
                    <li>
                        {t('notebooks-usage-data')}
                        <ul>
                            <li>{t('views-of-notebook-page')}</li>
                            <li>{t('views-of-notebooks-list-page')}</li>
                            <li>{t('views-of-embedded-notebook-page')}</li>
                            <li>{t('created-notebooks-count')}</li>
                            <li>{t('added-notebook-stars-count')}</li>
                            <li>{t('added-notebook-markdown-blocks-count')}</li>
                            <li>{t('added-notebook-query-blocks-count')}</li>
                            <li>{t('added-notebook-file-blocks-count')}</li>
                            <li>{t('added-notebook-symbol-blocks-count')}</li>
                            <li>{t('added-notebook-compute-blocks-count')}</li>
                        </ul>
                    </li>
                    <li>
                        {t('code-host-integration-usage-data')}
                        <ul>
                            <li>{t('daily-weekly-monthly-unique-users-and-events-counts')}</li>
                            <li>{t('daily-weekly-monthly-users-from-browser-extension')}</li>
                        </ul>
                    </li>
                    <li>
                        {t('ide-extensions-data')}
                        <ul>
                            <li>
                                {t('daily-searches-performed-counts')}
                                <ul>
                                    <li>{t('unique-users-performing-searches-count')}</li>
                                    <li>{t('total-searches-performed-count')}</li>
                                </ul>
                            </li>
                        </ul>
                        <ul>
                            <li>{t('daily-user-state-aggregate-counts')}</li>
                            <ul>
                                <li>{t('unique-users-installed-extension-count')}</li>
                                <li>{t('unique-users-uninstalled-extension-count')}</li>
                            </ul>
                            <li>{t('daily-redirects-from-extension-count')}</li>
                        </ul>
                    </li>
                    <li>
                        {t('migrated-extensions-data')}
                        <ul>
                            <li>{t('migrated-extensions-aggregate-data')}</li>
                            <ul>
                                <li>{t('git-blame-feature-interactions-count')}</li>
                                <li>{t('unique-users-interacted-with-git-blame-count')}</li>
                                <li>{t('open-in-editor-feature-interactions-count')}</li>
                                <li>{t('unique-users-interacted-with-open-in-editor-count')}</li>
                                <li>{t('search-exports-feature-interactions-count')}</li>
                                <li>{t('unique-users-interacted-with-search-exports-count')}</li>
                            </ul>
                        </ul>
                    </li>
                    <li>
                        {t('code-ownership-usage-data')}
                        <ul>
                            <li>{t('repositories-with-ownership-data-count')}</li>
                            <li>{t('total-assigned-owners-count')}</li>
                            <li>{t('active-users-aggregate-counts')}</li>
                            <ul>
                                <li>{t('narrowing-search-results-by-owner')}</li>
                                <li>{t('selecting-owner-search-result')}</li>
                                <li>{t('displaying-ownership-panel-in-file-view')}</li>
                            </ul>
                        </ul>
                    </li>
                    <li>{t('histogram-of-cloned-repository-sizes')}</li>
                    <li>{t('repository-metadata-usage-statistics')}</li>
                    <li>
                        {t('cody-providers-data')}
                        <ul>
                            <li>
                                {t('completions')}
                                <ul>
                                    <li>{t('provider-description')}</li>
                                    <li>{t('chat-model')}</li>
                                    <li>{t('fast-chat-model')}</li>
                                    <li>{t('completion-model')}</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li>{t('cody-context-filters-configured')}</li>
                </ul>
                {updatesDisabled && <Text>{t('telemetry-disabled')}</Text>}
            </Container>
        </div>
    )
}
