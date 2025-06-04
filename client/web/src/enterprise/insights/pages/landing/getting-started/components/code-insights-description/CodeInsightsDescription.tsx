import React from 'react'

import { mdiOpenInNew } from '@mdi/js'
import { useTranslation } from 'react-i18next'

import { H2, H3, Icon, Text, Link } from '@sourcegraph/wildcard'

interface Props {
    className?: string
}

const productPageUrl = 'https://sourcegraph.com/code-insights'

/**
 * The product description for Code Insights.
 */
export const CodeInsightsDescription: React.FunctionComponent<Props> = ({ className }) => {
    const { t } = useTranslation(
        'enterprise/insights/pages/landing/getting-started/components/code-insights-description'
    )

    return (
        <section className={className}>
            <H2>{t('track-what-matters-in-your-code')}</H2>

            <Text>{t('code-insights-description')}</Text>

            <div>
                <H3>{t('use-code-insights-to')}</H3>

                <ul>
                    <li>{t('track-migrations-adoption-deprecations')}</li>
                    <li>{t('detect-versions-of-languages-packages-infrastructure')}</li>
                    <li>{t('ensure-removal-of-security-vulnerabilities')}</li>
                    <li>{t('track-code-smells-ownership-configurations')}</li>
                    <li>
                        <Link to="/help/code_insights/references/common_use_cases" rel="noopener">
                            {t('see-more-use-cases')}
                        </Link>
                    </li>
                </ul>
            </div>

            <H3>{t('resources')}</H3>
            <ul>
                <li>
                    <Link to="/help/code_insights" target="_blank" rel="noopener">
                        {t('documentation')}
                        <Icon role="img" aria-label="Open in a new tab" svgPath={mdiOpenInNew} />
                    </Link>
                </li>
                <li>
                    <Link to={productPageUrl} target="_blank" rel="noopener">
                        {t('product-page')}
                        <Icon role="img" aria-label="Open in a new tab" svgPath={mdiOpenInNew} />
                    </Link>
                </li>
            </ul>
        </section>
    )
}
