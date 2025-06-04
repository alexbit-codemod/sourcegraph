import { useEffect, type FC, useCallback } from 'react'

import { mdiOpenInNew } from '@mdi/js'
import { useTranslation } from 'react-i18next'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { useIsLightTheme } from '@sourcegraph/shared/src/theme'
import { H2, Text, ButtonLink, Link, Icon } from '@sourcegraph/wildcard'

import { BatchChangesLogo } from './BatchChangesLogo'
import { CodeNavLogo } from './CodeNavLogo'
import { CodeSearchIcon } from './CodeSearchIcon'
import { FeatureImage } from './Feature'
import { IntegrationsIcon } from './IntegrationsIcon'
import { SearchExample } from './SearchExample'

import styles from './SearchUpsellPage.module.scss'

interface Props extends TelemetryV2Props {}

interface SearchFeature {
    title: string
    description: string
}

const searchFeatures: SearchFeature[] = [
    {
        title: 'Reuse high-quality code',
        description: 'Find code across thousands of repositories and multiple code hosts in seconds.',
    },
    {
        title: 'Resolve issues and incidents faster',
        description: 'Pinpoint root causes with symbol, commit, and diff searches.',
    },
    {
        title: 'Exhaustive search',
        description:
            "Discover every instance of vulnerable or buggy code in milliseconds and have complete confidence in what's in your codebase.",
    },
]

export const SearchUpsellPage: FC<Props> = ({ telemetryRecorder }) => {
    const { t } = useTranslation('search/upsell')

    useEffect(() => telemetryRecorder.recordEvent('searchUpsell', 'view'), [telemetryRecorder])
    const onClickExpertCTA = useCallback(
        () => telemetryRecorder.recordEvent('searchUpsell.talkToAnExpertCTA', 'click'),
        [telemetryRecorder]
    )
    const onClickFindOutMoreCTA = useCallback(
        () => telemetryRecorder.recordEvent('searchUpsell.findOutMoreCTA', 'click'),
        [telemetryRecorder]
    )

    const isLightTheme = useIsLightTheme()
    const contactSalesLink = 'https://sourcegraph.com/contact/request-info'
    const findOutMoreLink = 'https://sourcegraph.com/code-search'
    return (
        <div className={styles.container}>
            <section className={styles.hero}>
                <CodeSearchIcon isLightTheme={isLightTheme} />

                <section className={styles.heroHeaderContainer}>
                    <H2 className={styles.heroHeader}>{t('grok-your-entire-codebase')}</H2>
                    <Text className={styles.heroDescription}>{t('code-search-introduction')}</Text>
                </section>

                <div className={styles.heroCtaContainer}>
                    <ButtonLink
                        to={contactSalesLink}
                        variant="primary"
                        className="py-2 px-3 rounded mr-4"
                        target="_blank"
                        rel="noreferrer"
                        onClick={onClickExpertCTA}
                    >
                        {t('talk-to-product-expert')}
                    </ButtonLink>

                    <ButtonLink
                        to={findOutMoreLink}
                        variant="secondary"
                        className="py-2 px-3 rounded"
                        target="_blank"
                        rel="noreferrer"
                        onClick={onClickFindOutMoreCTA}
                    >
                        {t('find-out-more')}
                    </ButtonLink>
                </div>
            </section>
            <SearchExample isLightTheme={isLightTheme} className={styles.searchExample} />

            <section className={styles.features}>
                <section className={styles.featuresMeta}>
                    <div>
                        <CodeSearchIcon isLightTheme={isLightTheme} className={styles.featuresCodeSearchIcon} />
                        <Text className={styles.featuresTagLine}>{t('find-fix-code-in-any-code-host')}</Text>
                    </div>
                    <FeatureImage className={styles.featuresImage} isLightTheme={isLightTheme} />
                </section>
                <section className={styles.featuresGrid}>
                    {searchFeatures.map(({ title, description }, index) => (
                        <div key={index} className={styles.featuresCard}>
                            <Text className={styles.featuresCardTitle}>{title}</Text>
                            <Text className={styles.featuresCardDescription}>{description}</Text>
                        </div>
                    ))}
                </section>
            </section>

            <section className={styles.integrations}>
                <section className={styles.integrationsMeta}>
                    <Text className={styles.integrationsHeader}>{t('code-search-integrates-with-cody')}</Text>
                    <Text className={styles.integrationsDescription}>{t('use-cody-in-code-search')}</Text>
                </section>

                <IntegrationsIcon />
            </section>

            <section className={styles.otherIntegrations}>
                <div className={styles.otherIntegrationsGrid}>
                    <CodeNavLogo className={styles.otherIntegrationsLogo} />
                    <Text className={styles.otherIntegrationsTitle}>{t('understand-your-code-dependencies')}</Text>
                    <Text className={styles.otherIntegrationsDescription}>
                        {t('complete-code-reviews-impact-of-changes')}
                    </Text>
                    <Link
                        to="/help/code_navigation/explanations/introduction_to_code_navigation"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t('find-out-more-about-code-navigation')}
                        <Icon
                            className={styles.otherIntegrationsLinkIcon}
                            svgPath={mdiOpenInNew}
                            inline={true}
                            aria-label="Learn about Code Navigation"
                        />
                    </Link>
                </div>

                <section className={styles.otherIntegrationsGrid}>
                    <BatchChangesLogo className={styles.otherIntegrationsLogo} />
                    <Text className={styles.otherIntegrationsTitle}>{t('automate-large-scale-code-changes')}</Text>
                    <Text className={styles.otherIntegrationsDescription}>
                        {t('find-and-make-code-changes-programmatically')}
                    </Text>
                    <Link
                        to="https://sourcegraph.com/case-studies/indeed-accelerates-development-velocity"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {t('indeed-uses-batch-changes')}
                        <Icon
                            className={styles.otherIntegrationsLinkIcon}
                            svgPath={mdiOpenInNew}
                            inline={true}
                            aria-label="Learn about Batch Changes"
                        />
                    </Link>
                </section>
            </section>

            <section className={styles.footer}>
                <Text className={styles.footerText}>{t('code-search-works-great-with')}</Text>
                <Link to="/help/code_monitoring" target="_blank" rel="noreferrer">
                    {t('code-monitoring')}
                    <Icon svgPath={mdiOpenInNew} inline={false} aria-label="Learn more about Code Monitoring" />
                </Link>
                <Link to="/help/code_insights" target="_blank" rel="noreferrer">
                    {t('insights')}
                    <Icon svgPath={mdiOpenInNew} inline={false} aria-label="Learn more about Code Insights" />
                </Link>
                <Link to="/help/notebooks" target="_blank" rel="noreferrer">
                    {t('notebooks')}
                    <Icon svgPath={mdiOpenInNew} inline={false} aria-label="Learn more about Notebooks" />
                </Link>
            </section>
        </div>
    )
}
