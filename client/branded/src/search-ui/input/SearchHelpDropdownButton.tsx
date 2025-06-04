import { useCallback, type FC } from 'react'

import { mdiHelpCircleOutline, mdiOpenInNew } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'

import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import {
    PopoverTrigger,
    PopoverContent,
    PopoverTail,
    Popover,
    Button,
    Position,
    Link,
    MenuDivider,
    MenuHeader,
    Icon,
    MenuText,
    Code,
} from '@sourcegraph/wildcard'

import styles from './SearchHelpDropdownButton.module.scss'

interface SearchHelpDropdownButtonProps extends TelemetryProps, TelemetryV2Props {
    isSourcegraphDotCom?: boolean
    className?: string
}

/**
 * A dropdown button that shows a menu with reference documentation for Sourcegraph search query
 * syntax.
 */
export const SearchHelpDropdownButton: FC<SearchHelpDropdownButtonProps> = props => {
    const { t } = useTranslation('../../branded/src/search-ui/input')

    const { isSourcegraphDotCom, className, telemetryService, telemetryRecorder } = props

    const onQueryDocumentationLinkClicked = useCallback(() => {
        telemetryService.log('SearchHelpDropdownQueryDocsLinkClicked')
        telemetryRecorder.recordEvent('search.helpDropdown.queryDocsLink', 'click')
    }, [telemetryService, telemetryRecorder])

    return (
        <Popover>
            <PopoverTrigger
                as={Button}
                variant="link"
                aria-label="Quick help for search"
                className={classNames(className, styles.triggerButton)}
                onClick={onQueryDocumentationLinkClicked}
            >
                <Icon
                    aria-hidden={true}
                    className="test-search-help-dropdown-button-icon"
                    svgPath={mdiHelpCircleOutline}
                />
            </PopoverTrigger>

            <PopoverContent position={Position.bottom} className={styles.content}>
                <MenuHeader>
                    <strong>{t('search-reference')}</strong>
                </MenuHeader>
                <MenuDivider />
                <MenuHeader>{t('finding-matches')}</MenuHeader>
                <ul className="list-unstyled px-2 mb-2">
                    <li>
                        <span className="text-muted small">{t('structural')}</span>{' '}
                        <Code weight="bold">{t('if-my-match')}</Code>
                    </li>
                    <li>
                        <span className="text-muted small">{t('regexp')}</span>{' '}
                        <Code weight="bold">{t('read-write-file')}</Code>
                    </li>
                    <li>
                        <span className="text-muted small">{t('exact')}</span>{' '}
                        <Code weight="bold">{t('fs-open-f')}</Code>
                    </li>
                </ul>
                <MenuDivider />
                <MenuHeader>{t('common-search-keywords')}</MenuHeader>
                <ul className="list-unstyled px-2 mb-2">
                    <li>
                        <Code>
                            <Trans i18nKey="repo-my-repo" components={{ '0': <strong /> }} />
                        </Code>
                    </li>
                    {isSourcegraphDotCom && (
                        <li>
                            <Code>
                                <Trans i18nKey="repo-github-org" components={{ '0': <strong /> }} />
                            </Code>
                        </li>
                    )}
                    <li>
                        <Code>
                            <Trans i18nKey="file-my-file" components={{ '0': <strong /> }} />
                        </Code>
                    </li>
                    <li>
                        <Code>
                            <Trans i18nKey="lang-javascript" components={{ '0': <strong /> }} />
                        </Code>
                    </li>
                </ul>
                <MenuDivider />
                <MenuHeader>{t('diff-commit-search-keywords')}</MenuHeader>
                <ul className="list-unstyled px-2 mb-2">
                    <li>
                        <Code>{t('type-diff')}</Code> <em className="text-muted small">{t('or')}</em>{' '}
                        <Code>{t('type-commit')}</Code>
                    </li>
                    <li>
                        <Code>
                            <Trans i18nKey="after-2-weeks-ago" components={{ '0': <strong /> }} />
                        </Code>
                    </li>
                    <li>
                        <Code>
                            <Trans i18nKey="author-alice-email" components={{ '0': <strong /> }} />
                        </Code>
                    </li>
                    <li className="text-nowrap">
                        <Code>
                            <Trans i18nKey="repo-r-refs-heads" components={{ '0': <strong /> }} />
                        </Code>{' '}
                        <span className="text-muted small">{t('all-branches')}</span>
                    </li>
                </ul>
                <MenuDivider className="mb-0" />
                <MenuText
                    target="_blank"
                    rel="noopener"
                    as={Link}
                    to="/help/code_search/reference/queries"
                    onClick={onQueryDocumentationLinkClicked}
                >
                    <Icon aria-hidden={true} className="small" svgPath={mdiOpenInNew} />
                    {t('all-search-keywords')}
                </MenuText>
            </PopoverContent>
            <PopoverTail size="sm" />
        </Popover>
    )
}
