import React from 'react'

import { mdiDotsHorizontal } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'

import { PageHeader, Link, Icon } from '@sourcegraph/wildcard'

import type { RepositoryCompareAreaPageProps } from './RepositoryCompareArea'
import { RepositoryComparePopover } from './RepositoryComparePopover'

import styles from './RepositoryCompareHeader.module.scss'

interface RepositoryCompareHeaderProps extends RepositoryCompareAreaPageProps {
    className: string
}

export const RepositoryCompareHeader: React.FunctionComponent<
    React.PropsWithChildren<RepositoryCompareHeaderProps>
> = ({ base, head, className, repo, telemetryRecorder }) => {
    const { t } = useTranslation('repo/compare')

    return (
        <div className={classNames(styles.repositoryCompareHeader, className)}>
            <PageHeader
                description={
                    <span className="d-block mb-3">
                        <Trans
                            i18nKey="select-revision-or-git-revspec"
                            components={{
                                '0': (
                                    <Link
                                        to="https://git-scm.com/docs/git-rev-parse.html#_specifying_revisions"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    />
                                ),
                            }}
                        />
                    </span>
                }
            >
                <PageHeader.Heading as="h2" styleAs="h1">
                    <PageHeader.Breadcrumb>{t('compare-changes-across-revisions')}</PageHeader.Breadcrumb>
                </PageHeader.Heading>
            </PageHeader>
            <div className="d-flex align-items-center">
                <RepositoryComparePopover
                    id="base-popover"
                    type="base"
                    comparison={{ base, head }}
                    repo={repo}
                    telemetryRecorder={telemetryRecorder}
                />
                <Icon className="mx-2" aria-hidden={true} svgPath={mdiDotsHorizontal} />
                <RepositoryComparePopover
                    id="head-popover"
                    type="head"
                    comparison={{ base, head }}
                    repo={repo}
                    telemetryRecorder={telemetryRecorder}
                />
            </div>
        </div>
    )
}
