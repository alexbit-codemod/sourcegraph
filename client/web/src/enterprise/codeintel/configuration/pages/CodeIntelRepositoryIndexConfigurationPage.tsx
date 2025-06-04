import { type FunctionComponent, useEffect, useState } from 'react'

import { useTranslation, Trans } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { PageHeader, Link, Tabs, TabList, Tab, TabPanels, TabPanel } from '@sourcegraph/wildcard'

import type { AuthenticatedUser } from '../../../../auth'
import { PageTitle } from '../../../../components/PageTitle'
import { CodeIntelConfigurationPageHeader } from '../components/CodeIntelConfigurationPageHeader'
import { ConfigurationEditor } from '../components/ConfigurationEditor'
import { ConfigurationForm } from '../components/ConfigurationForm'

export interface CodeIntelRepositoryIndexConfigurationPageProps extends TelemetryProps, TelemetryV2Props {
    repo: { id: string }
    authenticatedUser: AuthenticatedUser | null
}

export const CodeIntelRepositoryIndexConfigurationPage: FunctionComponent<
    CodeIntelRepositoryIndexConfigurationPageProps
> = ({ repo, authenticatedUser, telemetryService, telemetryRecorder, ...props }) => {
    const { t } = useTranslation('enterprise/codeintel/configuration/pages')

    useEffect(() => {
        telemetryService.logViewEvent('CodeIntelRepositoryIndexConfiguration')
        telemetryRecorder.recordEvent('repo.codeIntel.indexConfig', 'view')
    }, [telemetryService, telemetryRecorder])
    const location = useLocation()

    const [activeTabIndex, setActiveTabIndex] = useState<number>(0)

    useEffect(() => {
        const tab = new URLSearchParams(location.search).get('tab')
        if (tab === 'form') {
            setActiveTabIndex(0)
            telemetryRecorder.recordEvent('repo.codeIntel.indexConfig.tab', 'click', { metadata: { tab: 0 } })
        } else if (tab === 'raw') {
            setActiveTabIndex(1)
            telemetryRecorder.recordEvent('repo.codeIntel.indexConfig.tab', 'click', { metadata: { tab: 1 } })
        }
    }, [location.search, telemetryRecorder])

    return (
        <>
            <PageTitle title={t('code-graph-data-repository-index-configuration-title')} />
            <CodeIntelConfigurationPageHeader>
                <PageHeader
                    headingElement="h2"
                    path={[
                        {
                            text: <>{t('code-graph-data-repository-index-configuration-title-alt')}</>,
                        },
                    ]}
                    description={
                        <>
                            <Trans
                                i18nKey="index-job-configuration-description"
                                components={{
                                    '0': <Link to="/help/code_navigation/references/auto_indexing_configuration" />,
                                }}
                            />
                        </>
                    }
                    className="mb-3"
                />
            </CodeIntelConfigurationPageHeader>
            <Tabs size="large" index={activeTabIndex} lazy={true}>
                <TabList>
                    <Tab as={Link} to="?tab=form" key="form" className="text-decoration-none">
                        {t('form-label')}
                    </Tab>
                    <Tab as={Link} to="?tab=raw" key="raw" className="text-decoration-none">
                        {t('raw-label')}
                    </Tab>
                </TabList>
                <TabPanels className="mb-3">
                    <TabPanel>
                        <ConfigurationForm
                            repoId={repo.id}
                            authenticatedUser={authenticatedUser}
                            telemetryService={telemetryService}
                        />
                    </TabPanel>
                    <TabPanel>
                        <ConfigurationEditor
                            repoId={repo.id}
                            authenticatedUser={authenticatedUser}
                            telemetryService={telemetryService}
                            telemetryRecorder={telemetryRecorder}
                            {...props}
                        />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </>
    )
}
