import { useCallback, useState } from 'react'

import { mdiClose } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { RepoLink } from '@sourcegraph/shared/src/components/RepoLink'
import {
    Alert,
    Button,
    ErrorAlert,
    Form,
    Icon,
    Input,
    Label,
    LoadingSpinner,
    Select,
    Tooltip,
    useDebounce,
} from '@sourcegraph/wildcard'

import type { FilterOption } from '../../../components/FilteredConnection'
import type { PackageRepoReferenceKind } from '../../../graphql-operations'
import { prettyBytesBigint } from '../../../util/prettyBytesBigint'
import { useMatchingPackages } from '../hooks/useMatchingPackages'
import type { BlockType } from '../modal-content/AddPackageFilterModalContent'

import { FilterPackagesActions } from './FilterPackagesActions'

import styles from '../modal-content/AddPackageFilterModalContent.module.scss'

export interface MultiPackageState {
    nameFilter: string
    ecosystem: PackageRepoReferenceKind
}

interface MultiPackageFormProps {
    initialState: MultiPackageState
    filters: FilterOption[]
    setType: (type: BlockType) => void
    onDismiss: () => void
    onSave: (state: MultiPackageState) => Promise<unknown>
}

export const MultiPackageForm: React.FunctionComponent<MultiPackageFormProps> = ({
    initialState,
    filters,
    setType,
    onDismiss,
    onSave,
}) => {
    const { t } = useTranslation('site-admin/packages/components')

    const [blockState, setBlockState] = useState<MultiPackageState>(initialState)
    const query = useDebounce(blockState.nameFilter, 200)

    const isValid = useCallback((): boolean => {
        if (blockState.nameFilter === '') {
            return false
        }

        return true
    }, [blockState])

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>): Promise<unknown> => {
            event.preventDefault()

            if (!isValid()) {
                return Promise.resolve()
            }

            return onSave(blockState)
        },
        [blockState, isValid, onSave]
    )

    return (
        <>
            <Form onSubmit={handleSubmit} className="w-100 mb-3">
                <div>
                    <Label className="mb-2" id="package-name">
                        {t('name-label')}
                    </Label>
                    <div className={styles.inputRow}>
                        <Select
                            className={classNames('mr-1 mb-0', styles.ecosystemSelect)}
                            value={blockState.ecosystem}
                            onChange={event =>
                                setBlockState({
                                    ...blockState,
                                    ecosystem: event.target.value as PackageRepoReferenceKind,
                                })
                            }
                            required={true}
                            isCustomStyle={true}
                            aria-label="Ecosystem"
                        >
                            {filters.map(({ label, value }) => (
                                <option value={value} key={label}>
                                    {label}
                                </option>
                            ))}
                        </Select>
                        <Input
                            className="mr-2 flex-1"
                            value={blockState.nameFilter || ''}
                            required={true}
                            onChange={event => setBlockState({ ...blockState, nameFilter: event.target.value })}
                            placeholder={t('example-types-filter')}
                        />
                        <Tooltip content="Remove name filter">
                            <Button
                                className={classNames('text-danger', styles.inputRowButton)}
                                variant="icon"
                                onClick={() => setType('single')}
                            >
                                <Icon aria-hidden={true} svgPath={mdiClose} />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
                <div className="mt-3">
                    <Label className="mb-2">{t('version-label')}</Label>
                    <Alert variant="info">{t('all-versions-blocked-message')}</Alert>
                </div>
                <div className={styles.listContainer}>
                    <PackageList query={query} blockState={blockState} />
                </div>
                <FilterPackagesActions valid={isValid()} onDismiss={onDismiss} />
            </Form>
        </>
    )
}

interface PackageListProps {
    blockState: MultiPackageState
    query: string
}
const PackageList: React.FunctionComponent<PackageListProps> = ({ blockState, query }) => {
    const { t } = useTranslation('site-admin/packages/components')

    const [packageFetchLimit, setPackageFetchLimit] = useState(15)
    const { nodes, totalCount, loading, error } = useMatchingPackages({
        kind: blockState.ecosystem,
        filter: {
            nameFilter: {
                packageGlob: query,
            },
        },
        first: packageFetchLimit,
    })

    // Limit fetching more than 1000 packages
    const nextFetchLimit = Math.min(totalCount, 1000)

    if (loading) {
        return <LoadingSpinner className="d-block mx-auto mt-2" />
    }

    if (error) {
        return <ErrorAlert error={error} className="mt-2" />
    }

    return (
        <div className="mt-3">
            <Label className="mb-2">{t('summary-label')}</Label>
            <div className="d-flex justify-content-between text-muted">
                <span>
                    {totalCount === 0 ? (
                        <>{t('no-matching-packages-message')}</>
                    ) : (
                        <>
                            {totalCount === 1 ? (
                                <>{t('single-package-matching-message', { totalCount })}</>
                            ) : (
                                <>{t('multiple-packages-matching-message', { totalCount })}</>
                            )}
                            {t('filter-info-message', {
                                nodesLengthTotalCountShowingOnlyNodesLength: nodes.length < totalCount && (
                                    <> (showing only {nodes.length})</>
                                ),
                            })}
                        </>
                    )}
                </span>
                {nodes.length < totalCount && (
                    <Button variant="link" className="p-0 mr-3" onClick={() => setPackageFetchLimit(nextFetchLimit)}>
                        <>
                            {t('show-all-or-limited-packages', {
                                nextFetchLimitToString: nextFetchLimit.toString(),
                                nextFetchLimitTotalCount: nextFetchLimit === totalCount,
                            })}
                        </>
                    </Button>
                )}
            </div>
            {nodes.length > 0 && (
                <ul className={classNames('list-group mt-1', styles.list)}>
                    {nodes.map(node => {
                        const { t } = useTranslation('site-admin/packages/components')

                        return (
                            <li className="list-group-item" key={node.id}>
                                {node.blocked ? (
                                    <div className="d-flex justify-content-between">
                                        <>{node.name}</>
                                        <small className="text-danger">{t('package-already-blocked-message')}</small>
                                    </div>
                                ) : node.repository ? (
                                    <div className="d-flex justify-content-between">
                                        <RepoLink repoName={node.name} to={node.repository.url} />
                                        <small className="text-muted">
                                            {t('package-size-label')}
                                            {prettyBytesBigint(BigInt(node.repository.mirrorInfo.byteSize))}
                                        </small>
                                    </div>
                                ) : (
                                    <div className="d-flex justify-content-between">
                                        <>{node.name}</>
                                        <small className="text-muted">{t('package-not-synced-message')}</small>
                                    </div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
