import { type FunctionComponent, useEffect, useMemo, useState } from 'react'

import { mdiDelete, mdiPlus } from '@mdi/js'
import classNames from 'classnames'
import { debounce } from 'lodash'
import { useTranslation } from 'react-i18next'

import {
    Alert,
    Button,
    Code,
    ErrorAlert,
    Icon,
    Input,
    Link,
    LoadingSpinner,
    Text,
    Tooltip,
} from '@sourcegraph/wildcard'

import { ExternalRepositoryIcon } from '../../../../site-admin/components/ExternalRepositoryIcon'
import { usePreviewRepositoryFilter } from '../hooks/usePreviewRepositoryFilter'

import styles from './RepositoryPatternList.module.scss'

const DEBOUNCED_WAIT = 250

const DEFAULT_FETCH_LIMIT = 15

interface RepositoryPatternListProps {
    repositoryPatterns: string[]
    setRepositoryPatterns: (updater: (patterns: string[] | null) => string[] | null) => void
}

export const RepositoryPatternList: FunctionComponent<RepositoryPatternListProps> = ({
    repositoryPatterns,
    setRepositoryPatterns,
}) => {
    const { t } = useTranslation('enterprise/codeintel/configuration/components')

    const [autoFocusIndex, setAutoFocusIndex] = useState(-1)

    const addRepositoryPattern = (): void => {
        setRepositoryPatterns(repositoryPatterns =>
            repositoryPatterns && repositoryPatterns.length > 0 ? repositoryPatterns.concat(['']) : ['*']
        )
        setAutoFocusIndex(repositoryPatterns.length)
    }

    const handleDelete = (index: number): void => {
        setRepositoryPatterns(repositoryPatterns =>
            (repositoryPatterns || []).filter((___, index_) => index !== index_)
        )
        setAutoFocusIndex(index - 1)
    }

    return (
        <div className={styles.container}>
            {repositoryPatterns.map((repositoryPattern, index) => (
                <div key={index} className={styles.inputContainer}>
                    <RepositoryPattern
                        index={index}
                        autoFocus={index === autoFocusIndex}
                        pattern={repositoryPattern}
                        setPattern={value =>
                            setRepositoryPatterns(repositoryPatterns =>
                                (repositoryPatterns || []).map((value_, index_) => (index === index_ ? value : value_))
                            )
                        }
                    />
                    <div className={styles.inputActions}>
                        <Tooltip content="Delete this repository pattern">
                            <Button
                                aria-label="Delete the repository pattern"
                                className={styles.inputAction}
                                variant="icon"
                                onClick={() => handleDelete(index)}
                            >
                                <Icon className="text-danger" aria-hidden={true} svgPath={mdiDelete} />
                            </Button>
                        </Tooltip>

                        {index === repositoryPatterns.length - 1 && (
                            <Tooltip content="Add an additional repository pattern">
                                <Button
                                    aria-label="Add an additional repository pattern"
                                    className={styles.inputAction}
                                    variant="icon"
                                    onClick={addRepositoryPattern}
                                >
                                    <Icon className="text-primary" aria-hidden={true} svgPath={mdiPlus} />
                                </Button>
                            </Tooltip>
                        )}
                    </div>
                </div>
            ))}

            {repositoryPatterns.length === 0 && (
                <Button variant="secondary" aria-label="Add a repository pattern" onClick={addRepositoryPattern}>
                    {t('add-repository-pattern')}
                </Button>
            )}

            <div className="d-flex flex-column">
                {repositoryPatterns && repositoryPatterns.length > 0 && (
                    <RepositoryList repositoryPatterns={repositoryPatterns} />
                )}
            </div>
        </div>
    )
}

interface RepositoryListProps {
    repositoryPatterns: string[]
}

const RepositoryList: FunctionComponent<RepositoryListProps> = ({ repositoryPatterns }) => {
    const { t } = useTranslation('enterprise/codeintel/configuration/components')

    const [repositoryFetchLimit, setRepositoryFetchLimit] = useState(DEFAULT_FETCH_LIMIT)
    const {
        previewResult: preview,
        isLoadingPreview: previewLoading,
        previewError,
    } = usePreviewRepositoryFilter(repositoryPatterns, repositoryFetchLimit)

    useEffect(() => {
        setRepositoryFetchLimit(DEFAULT_FETCH_LIMIT)
    }, [repositoryPatterns])

    if (previewError) {
        return <ErrorAlert prefix="Error fetching matching repositories" error={previewError} />
    }

    if (previewLoading) {
        return <LoadingSpinner className={styles.loading} />
    }

    if (!preview) {
        return null
    }

    // Limit fetching more than 1000 repos
    const nextFetchLimit = Math.min(preview.totalCount, 1000)

    return preview.repositories.length === 0 ? (
        <>
            {!(repositoryPatterns.length === 1 && repositoryPatterns[0] === '') && (
                <Alert variant="warning">{t('no-matching-repositories')}</Alert>
            )}
        </>
    ) : (
        <>
            {preview.totalMatches > preview.totalCount && (
                <Alert variant="warning">
                    <Text weight="medium" className="mb-1">
                        {t('too-many-matching-repositories')}
                    </Text>
                    {preview.totalMatches}
                    {t('repositories-matched-by-filter')}
                    <Code as={Link} to="/site-admin/configuration">
                        codeIntelAutoIndexing.policyRepositoryMatchLimit
                    </Code>
                    {t('setting-is')}
                    {preview.limit}
                    {t('repositories')}
                </Alert>
            )}
            <div className="d-flex justify-content-between">
                <span>
                    {preview.totalCount === 1 ? (
                        <>
                            {preview.totalCount}
                            {t('repository-matches')}
                        </>
                    ) : (
                        <>
                            {preview.totalCount}
                            {t('repositories-match')}
                        </>
                    )}{' '}
                    {repositoryPatterns.filter(pattern => pattern !== '').length === 1 ? (
                        <>{t('this-pattern')}</>
                    ) : (
                        <>
                            {t('number-of-patterns', {
                                repositoryPatternsFilterPatternPatternLength: repositoryPatterns.filter(
                                    pattern => pattern !== ''
                                ).length,
                            })}
                        </>
                    )}
                    {preview.repositories.length < preview.totalCount && (
                        <>{t('showing-repositories', { previewRepositoriesLength: preview.repositories.length })}</>
                    )}
                    :
                </span>
                {preview.repositories.length < preview.totalCount && (
                    <Button variant="link" className="p-0" onClick={() => setRepositoryFetchLimit(nextFetchLimit)}>
                        {t('show-all-or-limited-repositories', {
                            nextFetchLimitPreviewTotalCountAll: nextFetchLimit === preview.totalCount && 'all ',
                            nextFetchLimit,
                        })}
                    </Button>
                )}
            </div>
            <ul className={classNames('list-group', styles.list)}>
                {preview.repositories.map(repo => (
                    <li key={repo.name} className="list-group-item">
                        {repo.externalRepository && <ExternalRepositoryIcon externalRepo={repo.externalRepository} />}
                        <Link to={repo.url} target="_blank" rel="noopener noreferrer">
                            {repo.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    )
}

interface RepositoryPatternProps {
    index: number
    pattern: string
    setPattern: (value: string) => void
    autoFocus?: boolean
}

const RepositoryPattern: FunctionComponent<RepositoryPatternProps> = ({ index, pattern, setPattern, autoFocus }) => {
    const [localPattern, setLocalPattern] = useState('')
    useEffect(() => setLocalPattern(pattern), [pattern])
    const debouncedSetPattern = useMemo(() => debounce(value => setPattern(value), DEBOUNCED_WAIT), [setPattern])

    return (
        <div className={styles.input}>
            <div className="input-group">
                <div className="input-group-prepend">
                    <span className="input-group-text">{index === 0 ? 'Filter' : 'or'}</span>
                </div>

                <Input
                    type="text"
                    inputClassName="text-monospace"
                    value={localPattern}
                    onChange={({ target: { value } }) => {
                        setLocalPattern(value)
                        debouncedSetPattern(value)
                    }}
                    autoFocus={autoFocus}
                    required={true}
                    placeholder={index === 0 ? 'Example: github.com/*' : undefined}
                />
            </div>
        </div>
    )
}
