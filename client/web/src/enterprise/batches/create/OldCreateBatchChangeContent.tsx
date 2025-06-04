import React, { useCallback, useState } from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { CodeSnippet } from '@sourcegraph/branded/src/components/CodeSnippet'
import { Container, Button, Link, H2, Text } from '@sourcegraph/wildcard'

import { SidebarGroup, SidebarGroupHeader } from '../../../components/Sidebar'
import combySample from '../batch-spec/edit/library/comby.batch.yaml'
import goImportsSample from '../batch-spec/edit/library/go-imports.batch.yaml'
import helloWorldSample from '../batch-spec/edit/library/hello-world.batch.yaml'
import minimalSample from '../batch-spec/edit/library/minimal.batch.yaml'
import { getFileName } from '../BatchSpec'

// SampleTabHeader is superseded by ExampleTabs and can be removed when SSBC is rolled out
// at the same time as this exported component from this file is removed
interface SampleTabHeaderProps {
    sample: Sample
    active: boolean
    setSelectedSample: (sample: Sample) => void
}

const SampleTabHeader: React.FunctionComponent<React.PropsWithChildren<SampleTabHeaderProps>> = ({
    sample,
    active,
    setSelectedSample,
}) => {
    const onClick = useCallback<React.MouseEventHandler>(
        event => {
            event.preventDefault()
            setSelectedSample(sample)
        },
        [setSelectedSample, sample]
    )
    return (
        <Button
            onClick={onClick}
            className="text-left sidebar__link--inactive d-flex w-100"
            variant={active ? 'primary' : undefined}
        >
            {sample.name}
        </Button>
    )
}

interface Sample {
    name: string
    file: string
}

const samples: Sample[] = [
    { name: 'Hello world', file: helloWorldSample },
    { name: 'Modify with comby', file: combySample },
    { name: 'Update go imports', file: goImportsSample },
    { name: 'Minimal', file: minimalSample },
]

export const OldBatchChangePageContent: React.FunctionComponent<React.PropsWithChildren<{}>> = () => {
    const { t } = useTranslation('enterprise/batches/create')

    const [selectedSample, setSelectedSample] = useState<Sample>(samples[0])

    return (
        <>
            <H2 data-testid="batch-spec-yaml-file">{t('write-batch-spec-yaml-file')}</H2>
            <Container className="mb-3">
                <Text className="mb-0">
                    <Trans
                        i18nKey="batch-spec-description"
                        components={{
                            '0': (
                                <Link
                                    to="/help/batch_changes/references/batch_spec_yaml_reference"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                />
                            ),
                        }}
                    />
                </Text>
            </Container>
            <div className="d-flex mb-3">
                <div className="flex-shrink-0">
                    <SidebarGroup>
                        <SidebarGroupHeader label={t('examples-header')} />
                        {samples.map(sample => (
                            <SampleTabHeader
                                key={sample.name}
                                sample={sample}
                                active={selectedSample.name === sample.name}
                                setSelectedSample={setSelectedSample}
                            />
                        ))}
                    </SidebarGroup>
                </div>
                <Container className="ml-3 flex-grow-1 overflow-auto">
                    <CodeSnippet code={selectedSample.file} language="yaml" className="mb-0" />
                </Container>
            </div>
            <H2>{t('preview-batch-change-sourcegraph-cli')}</H2>
            <Container className="mb-3">
                <Text>
                    <Trans
                        i18nKey="use-sourcegraph-cli-preview"
                        components={{
                            '0': (
                                <Link
                                    to="https://github.com/sourcegraph/src-cli"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                />
                            ),
                        }}
                    />
                </Text>
                <CodeSnippet
                    code={`src batch preview -f ${getFileName(selectedSample.name)}`}
                    language="bash"
                    className="mb-3"
                />
                <Text className="mb-0">{t('follow-url-for-preview')}</Text>
            </Container>
        </>
    )
}
