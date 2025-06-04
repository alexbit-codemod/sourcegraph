import React, { useEffect, useMemo } from 'react'

import { mapValues, values } from 'lodash'
import { useTranslation, Trans } from 'react-i18next'

import type { ExternalServiceKind } from '@sourcegraph/shared/src/graphql-operations'
import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { useIsLightTheme } from '@sourcegraph/shared/src/theme'
import { LoadingSpinner, useObservable, Alert, Link, H2, Text } from '@sourcegraph/wildcard'

import awsCodeCommitJSON from '../../../../schema/aws_codecommit.schema.json'
import azureDevOpsJSON from '../../../../schema/azuredevops.schema.json'
import bitbucketCloudSchemaJSON from '../../../../schema/bitbucket_cloud.schema.json'
import bitbucketServerSchemaJSON from '../../../../schema/bitbucket_server.schema.json'
import gerritSchemaJSON from '../../../../schema/gerrit.schema.json'
import githubSchemaJSON from '../../../../schema/github.schema.json'
import gitlabSchemaJSON from '../../../../schema/gitlab.schema.json'
import gitoliteSchemaJSON from '../../../../schema/gitolite.schema.json'
import goModulesSchemaJSON from '../../../../schema/go-modules.schema.json'
import jvmPackagesSchemaJSON from '../../../../schema/jvm-packages.schema.json'
import npmPackagesSchemaJSON from '../../../../schema/npm-packages.schema.json'
import otherExternalServiceSchemaJSON from '../../../../schema/other_external_service.schema.json'
import pagureSchemaJSON from '../../../../schema/pagure.schema.json'
import perforceSchemaJSON from '../../../../schema/perforce.schema.json'
import phabricatorSchemaJSON from '../../../../schema/phabricator.schema.json'
import pythonPackagesSchemaJSON from '../../../../schema/python-packages.schema.json'
import rubyPackagesSchemaJSON from '../../../../schema/ruby-packages.schema.json'
import rustPackagesSchemaJSON from '../../../../schema/rust-packages.schema.json'
import settingsSchemaJSON from '../../../../schema/settings.schema.json'
import siteSchemaJSON from '../../../../schema/site.schema.json'
import { PageTitle } from '../components/PageTitle'
import { DynamicallyImportedMonacoSettingsEditor } from '../settings/DynamicallyImportedMonacoSettingsEditor'

import { fetchAllConfigAndSettings } from './backend'

/**
 * Minimal shape of a JSON Schema. These values are treated as opaque, so more specific types are
 * not needed.
 */
interface JSONSchema {
    $id: string
    definitions?: Record<string, { type: string | string[] }>
}

const externalServices: Record<ExternalServiceKind, JSONSchema> = {
    AWSCODECOMMIT: awsCodeCommitJSON,
    AZUREDEVOPS: azureDevOpsJSON,
    BITBUCKETCLOUD: bitbucketCloudSchemaJSON,
    BITBUCKETSERVER: bitbucketServerSchemaJSON,
    GERRIT: gerritSchemaJSON,
    GITHUB: githubSchemaJSON,
    GITLAB: gitlabSchemaJSON,
    GITOLITE: gitoliteSchemaJSON,
    GOMODULES: goModulesSchemaJSON,
    JVMPACKAGES: jvmPackagesSchemaJSON,
    NPMPACKAGES: npmPackagesSchemaJSON,
    PYTHONPACKAGES: pythonPackagesSchemaJSON,
    RUSTPACKAGES: rustPackagesSchemaJSON,
    RUBYPACKAGES: rubyPackagesSchemaJSON,
    OTHER: otherExternalServiceSchemaJSON,
    PERFORCE: perforceSchemaJSON,
    PHABRICATOR: phabricatorSchemaJSON,
    PAGURE: pagureSchemaJSON,
}

const allConfigSchema = {
    $id: 'all.schema.json#',
    allowComments: true,
    additionalProperties: false,
    properties: {
        site: siteSchemaJSON,
        externalServices: {
            type: 'object',
            properties: mapValues(externalServices, schema => ({ type: 'array', items: schema })),
        },
        settings: {
            type: 'object',
            properties: {
                subjects: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            __typename: {
                                type: 'string',
                            },
                            settingsURL: {
                                type: ['string', 'null'],
                            },
                            contents: {
                                ...settingsSchemaJSON,
                                type: ['object', 'null'],
                            },
                        },
                    },
                },
                final: settingsSchemaJSON,
            },
        },
        alerts: {
            type: 'array',
            items: {
                type: 'object',
            },
        },
    },
    definitions: values(externalServices)
        .map(schema => schema.definitions)
        .concat([siteSchemaJSON.definitions, settingsSchemaJSON.definitions])
        .reduce((allDefinitions, definitions) => ({ ...allDefinitions, ...definitions }), {}),
}

interface Props extends TelemetryProps, TelemetryV2Props {}

export const SiteAdminReportBugPage: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    telemetryService,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('site-admin')

    useEffect(() => telemetryRecorder.recordEvent('admin.reportBug', 'view'), [telemetryRecorder])

    const isLightTheme = useIsLightTheme()
    const allConfig = useObservable(useMemo(fetchAllConfigAndSettings, []))
    return (
        <div>
            <PageTitle title={t('report-a-bug-admin')} />
            <H2>{t('report-a-bug')}</H2>
            <Text>
                <Trans
                    i18nKey="create-issue-public-tracker"
                    components={{
                        '0': (
                            <Link
                                target="_blank"
                                rel="noopener noreferrer"
                                to="https://github.com/sourcegraph/sourcegraph/issues/new?assignees=&labels=&template=bug_report.md&title="
                            />
                        ),
                        '1': <Link target="_blank" rel="noopener noreferrer" to="mailto:support@sourcegraph.com" />,
                    }}
                />
            </Text>
            <Alert variant="warning">
                <div>{t('redact-secrets-before-sharing')}</div>
            </Alert>
            {allConfig === undefined ? (
                <LoadingSpinner className="mt-2" />
            ) : (
                <DynamicallyImportedMonacoSettingsEditor
                    value={JSON.stringify(allConfig, undefined, 2)}
                    jsonSchema={allConfigSchema}
                    canEdit={false}
                    height={800}
                    isLightTheme={isLightTheme}
                    readOnly={true}
                    telemetryService={telemetryService}
                    telemetryRecorder={telemetryRecorder}
                />
            )}
        </div>
    )
}
