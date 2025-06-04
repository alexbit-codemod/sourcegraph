import React from 'react'

import { mdiClose } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'

import { useTemporarySetting } from '@sourcegraph/shared/src/settings/temporary'
import { Code, H2, Icon, Link, Text } from '@sourcegraph/wildcard'

import { MarketingBlock } from '../../../components/MarketingBlock'

import { KeywordSearchStarsIcon } from './KeywordSearchStarsIcon'

import styles from './KeywordSearchCtaSection.module.scss'

interface KeywordSearchCtaSection {
    className?: string
}

export const KeywordSearchCtaSection: React.FC<KeywordSearchCtaSection> = ({ className }) => {
    const { t } = useTranslation('storm/pages/SearchPage')

    const [isDismissed = true, setIsDismissed] = useTemporarySetting('search.homepage.keywordCta.dismissed', false)
    if (isDismissed) {
        return null
    }

    return (
        <MarketingBlock
            wrapperClassName={classNames(styles.container)}
            contentClassName={classNames('flex-grow-1 d-flex justify-content-between p-4', styles.card)}
        >
            <div>
                <H2 className="d-flex align-items-center">{t('new-keyword-search')}</H2>
                <div className="d-flex d-flex-column">
                    <div>
                        <KeywordSearchStarsIcon aria-hidden={true} />
                    </div>
                    <div>
                        <Text>
                            <ul>
                                <li>
                                    <Trans i18nKey="keyword-search-bar-support" components={{ '0': <b /> }} />
                                </li>
                                <li>{t('new-search-behavior-and-terms')}</li>
                                <li>
                                    {t('literal-search-query-in-quotes')}
                                    <Code>{t('error-101-service-failed')}</Code>
                                </li>
                            </ul>
                        </Text>
                        <Text>
                            <Trans
                                i18nKey="read-docs-for-more-info"
                                components={{
                                    '0': (
                                        <Link
                                            to="https://sourcegraph.com/docs/code-search/queries#keyword-search-default"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        />
                                    ),
                                }}
                            />
                        </Text>
                    </div>
                </div>
            </div>
            <Icon
                svgPath={mdiClose}
                aria-label="Close keyword search explanation"
                className={classNames(styles.closeButton)}
                onClick={() => setIsDismissed(true)}
            />
        </MarketingBlock>
    )
}
