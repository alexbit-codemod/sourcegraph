import React, { type FC, useState } from 'react'

import { mdiArrowLeft, mdiHelpCircleOutline } from '@mdi/js'
import { useTranslation } from 'react-i18next'

import { Icon, Tooltip, Button, Text, H3 } from '@sourcegraph/wildcard'

import { CodeSearchSimpleSearch, type SimpleSearchProps } from './CodeSearchSimpleSearch'
import { FindChangesSimpleSearch } from './FindChangesSimpleSearch'
import { RepoSearchSimpleSearch } from './RepoSearchSimpleSearch'

import styles from './SimpleSearch.module.scss'

const EVENT_PREFIX = 'SimpleSearch'

function eventName(name: string): string {
    return EVENT_PREFIX + name
}

type ShowStates = 'default' | 'code' | 'repo' | 'changes'

const v2ShowStateTypes: { [key in ShowStates]: number } = {
    default: 1,
    code: 2,
    repo: 3,
    changes: 4,
}

export const SimpleSearch: FC<SimpleSearchProps> = props => {
    const { t } = useTranslation('storm/pages/SearchPage')

    const [showState, setShowState] = useState<ShowStates>('default')

    function onSubmitWithTelemetry(event?: React.FormEvent): void {
        const arg = { type: showState }
        props.telemetryService.log(eventName('SubmitSearch'), arg, arg)
        props.telemetryRecorder.recordEvent('simpleSearch.search', 'submit', {
            metadata: { type: v2ShowStateTypes[showState] },
        })
        props.onSubmit(event)
    }

    function pickRender(): JSX.Element {
        const changeState = (nextState: ShowStates): void => {
            const arg = { next: nextState }
            props.telemetryService.log(eventName('SelectJob'), arg, arg)
            props.telemetryRecorder.recordEvent('simpleSearch.search.type', 'select', {
                metadata: { type: v2ShowStateTypes[nextState] },
            })
            setShowState(nextState)
        }

        const searchProps: SimpleSearchProps = { ...props, onSubmit: onSubmitWithTelemetry }

        switch (showState) {
            case 'default': {
                return <SearchPicker setShowState={changeState} />
            }
            case 'code': {
                return <CodeSearchSimpleSearch {...searchProps} />
            }
            case 'repo': {
                return <RepoSearchSimpleSearch {...searchProps} />
            }
            case 'changes': {
                return <FindChangesSimpleSearch {...searchProps} />
            }
            default: {
                return <SearchPicker setShowState={changeState} />
            }
        }
    }

    return (
        <div>
            {showState !== 'default' && (
                <div>
                    <Button
                        className="mb-2"
                        onClick={() => {
                            props.telemetryService.log(eventName('BackButtonClick'))
                            setShowState('default')
                        }}
                    >
                        <Icon aria-label="hover icon for help tooltip" svgPath={mdiArrowLeft} />
                        {t('back-button')}
                    </Button>
                    <Text>{t('search-instructions')}</Text>
                </div>
            )}
            {pickRender()}
        </div>
    )
}

interface SearchPickerProps {
    setShowState: (state: ShowStates) => void
}

const SearchPicker: FC<SearchPickerProps> = ({ setShowState }) => {
    const { t } = useTranslation('storm/pages/SearchPage')

    return (
        <div className="offset-1">
            <Tooltip content="This is useful if you are looking for something specific, or examples of code. Error messages, class names, variable names, etc.">
                <Button
                    onClick={() => setShowState('code')}
                    className={styles.searchButton}
                    variant="secondary"
                    outline={true}
                >
                    <div>
                        <H3>{t('find-code')}</H3>
                        <Text className="mt-2">{t('code-examples-search')}</Text>
                        <Icon
                            aria-label="hover icon for help tooltip"
                            className="ml-2"
                            svgPath={mdiHelpCircleOutline}
                        />
                    </div>
                </Button>
            </Tooltip>

            <Tooltip content="This is useful if you are looking for repositories. For example, you are looking for a library you think might exist and search using repository description.">
                <Button
                    onClick={() => setShowState('repo')}
                    className={styles.searchButton}
                    variant="secondary"
                    outline={true}
                >
                    <H3>{t('find-repositories')}</H3>
                    <Text className="mt-2">{t('repository-search-instructions')}</Text>
                    <Icon aria-label="hover icon for help tooltip" className="ml-2" svgPath={mdiHelpCircleOutline} />
                </Button>
            </Tooltip>

            <Tooltip content="This is useful if you are looking for changes over time, either in commit messages, by author, or code that has changed.">
                <Button
                    onClick={() => setShowState('changes')}
                    className={styles.searchButton}
                    variant="secondary"
                    outline={true}
                >
                    <H3>{t('find-changes')}</H3>
                    <Text className="mt-2">{t('commit-message-search')}</Text>
                    <Icon aria-label="hover icon for help tooltip" className="ml-2" svgPath={mdiHelpCircleOutline} />
                </Button>
            </Tooltip>
        </div>
    )
}
