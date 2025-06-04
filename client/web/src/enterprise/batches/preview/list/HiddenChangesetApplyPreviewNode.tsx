import React from 'react'

import { mdiInformationOutline } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { ChangesetState } from '@sourcegraph/shared/src/graphql-operations'
import { Icon, H3, Tooltip } from '@sourcegraph/wildcard'

import { InputTooltip } from '../../../../components/InputTooltip'
import { ChangesetSpecType, type HiddenChangesetApplyPreviewFields } from '../../../../graphql-operations'
import { ChangesetStatusCell } from '../../detail/changesets/ChangesetStatusCell'

import { PreviewActions } from './PreviewActions'
import { PreviewNodeIndicator } from './PreviewNodeIndicator'

import styles from './HiddenChangesetApplyPreviewNode.module.scss'

export interface HiddenChangesetApplyPreviewNodeProps {
    node: HiddenChangesetApplyPreviewFields
}

export const HiddenChangesetApplyPreviewNode: React.FunctionComponent<
    React.PropsWithChildren<HiddenChangesetApplyPreviewNodeProps>
> = ({ node }) => {
    const { t } = useTranslation('enterprise/batches/preview/list')

    return (
        <>
            <span className={classNames(styles.hiddenChangesetApplyPreviewNodeListCell, 'd-none d-sm-block')} />
            <div className="p-2">
                {/* eslint-disable-next-line no-restricted-syntax*/}
                <InputTooltip
                    id="select-changeset-hidden"
                    type="checkbox"
                    checked={false}
                    disabled={true}
                    tooltip="You do not have permission to publish to this repository."
                    placement="right"
                />
            </div>
            <HiddenChangesetApplyPreviewNodeStatusCell
                node={node}
                className={classNames(
                    styles.hiddenChangesetApplyPreviewNodeListCell,
                    styles.hiddenChangesetApplyPreviewNodeCurrentState,
                    'd-block d-sm-flex'
                )}
            />
            <PreviewNodeIndicator node={node} />
            <PreviewActions
                node={node}
                className={classNames(
                    styles.hiddenChangesetApplyPreviewNodeListCell,
                    styles.hiddenChangesetApplyPreviewNodeAction
                )}
            />
            <div
                className={classNames(
                    styles.hiddenChangesetApplyPreviewNodeListCell,
                    styles.hiddenChangesetApplyPreviewNodeInformation,
                    ' d-flex flex-column'
                )}
            >
                <H3 className="text-muted">
                    {node.targets.__typename === 'HiddenApplyPreviewTargetsAttach' ||
                    node.targets.__typename === 'HiddenApplyPreviewTargetsUpdate' ? (
                        <>
                            {node.targets.changesetSpec.type === ChangesetSpecType.EXISTING && (
                                <>{t('import-changeset-private-repo')}</>
                            )}
                            {node.targets.changesetSpec.type === ChangesetSpecType.BRANCH && (
                                <>{t('create-changeset-private-repo')}</>
                            )}
                        </>
                    ) : (
                        <>{t('detach-changeset-private-repo')}</>
                    )}
                </H3>
                <span className="text-danger">
                    {t('no-action-on-apply')}
                    <Tooltip content="You have no permissions to access this repository.">
                        <Icon
                            aria-label="You have no permissions to access this repository."
                            svgPath={mdiInformationOutline}
                        />
                    </Tooltip>
                </span>
            </div>
            <span />
            <span />
        </>
    )
}

const HiddenChangesetApplyPreviewNodeStatusCell: React.FunctionComponent<
    React.PropsWithChildren<HiddenChangesetApplyPreviewNodeProps & { className?: string }>
> = ({ node, className }) => {
    if (node.targets.__typename === 'HiddenApplyPreviewTargetsAttach') {
        return <ChangesetStatusCell state={ChangesetState.UNPUBLISHED} className={className} />
    }
    return <ChangesetStatusCell state={node.targets.changeset.state} className={className} />
}
