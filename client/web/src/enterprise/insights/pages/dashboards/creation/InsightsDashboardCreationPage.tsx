import React, { useContext, useMemo } from 'react'

import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { lastValueFrom } from 'rxjs'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { PageHeader, Container, Button, LoadingSpinner, useObservable, Link, Tooltip } from '@sourcegraph/wildcard'

import { LoaderButton } from '../../../../../components/LoaderButton'
import { PageTitle } from '../../../../../components/PageTitle'
import { CodeInsightsIcon, CodeInsightsPage } from '../../../components'
import { CodeInsightsBackendContext } from '../../../core'
import { useUiFeatures } from '../../../hooks'

import {
    type DashboardCreationFields,
    InsightsDashboardCreationContent,
} from './components/InsightsDashboardCreationContent'

import styles from './InsightsDashboardCreationPage.module.scss'

interface InsightsDashboardCreationPageProps extends TelemetryProps, TelemetryV2Props {}

export const InsightsDashboardCreationPage: React.FunctionComponent<
    React.PropsWithChildren<InsightsDashboardCreationPageProps>
> = props => {
    const { t } = useTranslation('enterprise/insights/pages/dashboards/creation')

    const { telemetryService, telemetryRecorder } = props

    const navigate = useNavigate()
    const { dashboard } = useUiFeatures()

    const { createDashboard, getDashboardOwners } = useContext(CodeInsightsBackendContext)

    const owners = useObservable(useMemo(() => getDashboardOwners(), [getDashboardOwners]))

    const handleSubmit = async (values: DashboardCreationFields): Promise<void> => {
        const { name, owner } = values

        if (!owner) {
            throw new Error('You have to specify a dashboard visibility')
        }

        const createdDashboard = await lastValueFrom(createDashboard({ name, owners: [owner] }))

        telemetryService.log('CodeInsightsDashboardCreationPageSubmitClick')
        telemetryRecorder.recordEvent('insights.dashboard', 'create')

        // Navigate user to the dashboard page with new created dashboard
        navigate(`/insights/dashboards/${createdDashboard.id}`)
    }

    const handleCancel = (): void => navigate(-1)

    // Loading state
    if (owners === undefined) {
        return <LoadingSpinner />
    }

    return (
        <CodeInsightsPage className={classNames('col-8', styles.page)}>
            <PageTitle title={t('add-dashboard-code-insights')} />

            <PageHeader path={[{ icon: CodeInsightsIcon }, { text: 'Add new dashboard' }]} />

            <span className="text-muted d-block mt-2">
                <Trans
                    i18nKey="dashboards-group-insights-learn-more"
                    components={{
                        '0': (
                            <Link
                                to="/help/code_insights/explanations/viewing_code_insights"
                                target="_blank"
                                rel="noopener"
                            />
                        ),
                    }}
                />
            </span>

            <Container className="mt-4">
                <InsightsDashboardCreationContent owners={owners} onSubmit={handleSubmit}>
                    {formAPI => {
                        const { t } = useTranslation('enterprise/insights/pages/dashboards/creation')

                        return (
                            <>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    outline={true}
                                    className="mb-2"
                                    onClick={handleCancel}
                                >
                                    {t('cancel-button')}
                                </Button>

                                <Tooltip content={dashboard.createPermissions.submit.tooltip}>
                                    <LoaderButton
                                        alwaysShowLabel={true}
                                        data-testid="insight-save-button"
                                        loading={formAPI.submitting}
                                        label={formAPI.submitting ? 'Adding' : 'Add dashboard'}
                                        type="submit"
                                        disabled={dashboard.createPermissions.submit.disabled || formAPI.submitting}
                                        className="ml-2 mb-2"
                                        variant="primary"
                                    />
                                </Tooltip>
                            </>
                        )
                    }}
                </InsightsDashboardCreationContent>
            </Container>
        </CodeInsightsPage>
    )
}
