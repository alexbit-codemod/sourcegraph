import React from 'react'

import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'

import { Badge, Link, Text } from '@sourcegraph/wildcard'

import styles from './CodeInsightsLimitAccessBanner.module.scss'

interface CodeInsightsLimitAccessBannerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CodeInsightsLimitAccessBanner: React.FunctionComponent<
    React.PropsWithChildren<CodeInsightsLimitAccessBannerProps>
> = props => {
    const { t } = useTranslation('enterprise/insights/components/code-insights-page/limit-access-banner')

    return (
        <div {...props} className={classNames(styles.banner, props.className)}>
            <div className={styles.content}>
                <Badge className={classNames('mb-2', styles.badge)}>{t('limited-access-message')}</Badge>
                <Text className="m-0">
                    <Trans
                        i18nKey="contact-admin-upgrade-license"
                        components={{
                            '0': <Link to="mailto:support@sourcegraph.com" target="_blank" rel="noopener noreferrer" />,
                            '1': (
                                <Link
                                    to="/help/code_insights/references/license"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                />
                            ),
                        }}
                    />
                </Text>
            </div>
        </div>
    )
}
