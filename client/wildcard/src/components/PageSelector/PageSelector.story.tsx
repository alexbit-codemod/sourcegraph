import { useState } from 'react'

import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { H1, H2 } from '..'
import { BrandedStory } from '../../stories/BrandedStory'

import { PageSelector } from './PageSelector'

const decorator: Decorator = story => (
    <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>
)

const config: Meta = {
    title: 'wildcard/PageSelector',
    component: PageSelector,
    decorators: [decorator],
}

export default config

export const Simple: StoryFn = (args = {}) => {
    const [page, setPage] = useState(1)
    return <PageSelector currentPage={page} onPageChange={setPage} totalPages={args.totalPages} />
}
Simple.argTypes = {
    totalPages: {
        name: 'maxPages',
        control: { type: 'number' },
    },
}
Simple.args = {
    totalPages: 5,
}

export const AllPageSelectors: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/PageSelector')

    return (
        <>
            <H1>{t('page-selector')}</H1>
            <H2>{t('short-option')}</H2>
            <Short />
            <H2>{t('long-option')}</H2>
            <Long />
            <H2>{t('long-active-option')}</H2>
            <LongActive />
            <H2>{t('long-complete-option')}</H2>
            <LongComplete />
            <H2>{t('long-on-mobile-option')}</H2>
            <LongOnMobile />
        </>
    )
}

AllPageSelectors.parameters = {
    chromatic: {
        enableDarkMode: true,
        disableSnapshot: false,
    },
}

const Short = () => {
    const [page, setPage] = useState(1)
    return <PageSelector currentPage={page} onPageChange={setPage} totalPages={5} />
}

const Long = () => {
    const [page, setPage] = useState(1)
    return <PageSelector currentPage={page} onPageChange={setPage} totalPages={10} />
}

const LongOnMobile = () => {
    const [page, setPage] = useState(1)
    return (
        <div style={{ width: 320 }}>
            <PageSelector currentPage={page} onPageChange={setPage} totalPages={10} />
        </div>
    )
}

const LongActive = () => {
    const [page, setPage] = useState(5)
    return <PageSelector currentPage={page} onPageChange={setPage} totalPages={10} />
}

const LongComplete = () => {
    const [page, setPage] = useState(10)
    return <PageSelector currentPage={page} onPageChange={setPage} totalPages={10} />
}
