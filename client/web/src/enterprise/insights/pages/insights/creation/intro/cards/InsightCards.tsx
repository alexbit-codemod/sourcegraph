import React from 'react'

import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'

import { Button, CardBody, Card, H2, H3, Text } from '@sourcegraph/wildcard'

import {
    CaptureGroupInsightChart,
    ComputeInsightChart,
    LangStatsInsightChart,
    SearchBasedInsightChart,
} from '../../../../../modals/components/MediaCharts'

import styles from './InsightCards.module.scss'

interface InsightCardProps extends React.HTMLAttributes<HTMLDivElement> {
    handleCreate?: () => void
}

/**
 * Low-level styled component for building insight link card for
 * the creation page gallery.
 */
const InsightCard: React.FunctionComponent<React.PropsWithChildren<InsightCardProps>> = props => {
    const { t } = useTranslation('enterprise/insights/pages/insights/creation/intro/cards')

    const { children, onClick, handleCreate, ...otherProps } = props

    return (
        <Card {...otherProps} className={classNames(styles.card, 'p-3', otherProps.className)}>
            {children}

            <Button className="mt-3 w-100" variant="secondary" onClick={handleCreate}>
                {t('create-action')}
            </Button>
        </Card>
    )
}

interface InsightCardBodyProps {
    title: string
    className?: string
}

const InsightCardBody: React.FunctionComponent<React.PropsWithChildren<InsightCardBodyProps>> = props => {
    const { title, className, children } = props

    return (
        <CardBody className={classNames(styles.cardBody, className, 'flex-1')}>
            <H3 as={H2} className={styles.cardTitle}>
                {title}
            </H3>
            <Text className="d-flex flex-column text-muted m-0">{children}</Text>
        </CardBody>
    )
}

const InsightCardExampleBlock: React.FunctionComponent<React.PropsWithChildren<unknown>> = props => {
    const { t } = useTranslation('enterprise/insights/pages/insights/creation/intro/cards')

    return (
        <footer className={styles.cardFooter}>
            <small className="text-muted">{t('example-use')}</small>
            <small className={styles.cardExampleBlock}>{props.children}</small>
        </footer>
    )
}

export const SearchInsightCard: React.FunctionComponent<React.PropsWithChildren<InsightCardProps>> = props => {
    const { t } = useTranslation('enterprise/insights/pages/insights/creation/intro/cards')

    return (
        <InsightCard {...props}>
            <SearchBasedInsightChart className={styles.chart} />
            <InsightCardBody title={t('track-changes')} className="mb-3">
                <Trans i18nKey="insight-custom-search-visualization" components={{ '0': <b />, '1': <b /> }} />
            </InsightCardBody>

            <InsightCardExampleBlock>{t('tracking-architecture-migrations')}</InsightCardExampleBlock>
        </InsightCard>
    )
}

export const ComputeInsightCard: React.FunctionComponent<React.PropsWithChildren<InsightCardProps>> = props => {
    const { t } = useTranslation('enterprise/insights/pages/insights/creation/intro/cards')

    return (
        <InsightCard {...props}>
            <ComputeInsightChart className={styles.chart} />
            <InsightCardBody title={t('group-results')} className="mb-3">
                <Trans i18nKey="insight-group-results" components={{ '0': <b /> }} />
            </InsightCardBody>

            <InsightCardExampleBlock>{t('tracking-migration-repository')}</InsightCardExampleBlock>
        </InsightCard>
    )
}

export const LangStatsInsightCard: React.FunctionComponent<React.PropsWithChildren<InsightCardProps>> = props => {
    const { t } = useTranslation('enterprise/insights/pages/insights/creation/intro/cards')

    return (
        <InsightCard {...props}>
            <LangStatsInsightChart viewBox="0 0 169 148" className={styles.chart} />
            <InsightCardBody title={t('language-usage')}>{t('shows-language-usage')}</InsightCardBody>
        </InsightCard>
    )
}

export const CaptureGroupInsightCard: React.FunctionComponent<React.PropsWithChildren<InsightCardProps>> = props => {
    const { t } = useTranslation('enterprise/insights/pages/insights/creation/intro/cards')

    return (
        <InsightCard {...props}>
            <CaptureGroupInsightChart className={styles.chart} />

            <InsightCardBody title={t('detect-track-patterns')} className="mb-3">
                <Trans i18nKey="dynamic-data-series-unique-values" components={{ '0': <b /> }} />
            </InsightCardBody>

            <InsightCardExampleBlock>{t('detecting-tracking-versions')}</InsightCardExampleBlock>
        </InsightCard>
    )
}
