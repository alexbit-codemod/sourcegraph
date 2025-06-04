import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { BrandedStory } from '../../../../stories/BrandedStory'
import { H2, Text } from '../../../Typography'

import { PieChart } from './PieChart'

const StoryConfig: Meta = {
    title: 'wildcard/Charts',
    decorators: [story => <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>],
    parameters: {
        chromatic: { disableSnapshots: false, enableDarkMode: true },
    },
}

export default StoryConfig

interface LanguageUsageDatum {
    name: string
    value: number
    fill: string
    linkURL: string
}

const getValue = (datum: LanguageUsageDatum) => datum.value
const getColor = (datum: LanguageUsageDatum) => datum.fill
const getLink = (datum: LanguageUsageDatum) => datum.linkURL
const getName = (datum: LanguageUsageDatum) => datum.name

export const PieChartDemo: StoryFn = () => (
    <main
        style={{
            display: 'flex',
            flexWrap: 'wrap',
            rowGap: 40,
            columnGap: 40,
            paddingBottom: 40,
        }}
    >
        <PlainPieChartExample />
        <ManyGroupsPieChartExample />
    </main>
)

const LANGUAGE_USAGE_DATA: LanguageUsageDatum[] = [
    {
        name: 'JavaScript',
        value: 422,
        fill: '#f1e05a',
        linkURL: 'https://en.wikipedia.org/wiki/JavaScript',
    },
    {
        name: 'CSS',
        value: 273,
        fill: '#563d7c',
        linkURL: 'https://en.wikipedia.org/wiki/CSS',
    },
    {
        name: 'HTML',
        value: 129,
        fill: '#e34c26',
        linkURL: 'https://en.wikipedia.org/wiki/HTML',
    },
    {
        name: 'Markdown',
        value: 35,
        fill: '#083fa1',
        linkURL: 'https://en.wikipedia.org/wiki/Markdown',
    },
]

const PlainPieChartExample = () => {
    const { t } = useTranslation('../../wildcard/src/components/Charts/components/pie-chart')

    return (
        <section style={{ flexBasis: 0 }}>
            <H2>{t('plain-pie-chart')}</H2>

            <Text>{t('standard-pie-chart-example')}</Text>

            <PieChart<LanguageUsageDatum>
                width={400}
                height={400}
                data={LANGUAGE_USAGE_DATA}
                getDatumName={getName}
                getDatumValue={getValue}
                getDatumColor={getColor}
                getDatumLink={getLink}
            />
        </section>
    )
}

const MANY_LANGUAGES_DATA: LanguageUsageDatum[] = [
    {
        name: 'JavaScript',
        value: 422,
        fill: '#f1e05a',
        linkURL: 'https://en.wikipedia.org/wiki/JavaScript',
    },
    {
        name: 'CSS',
        value: 273,
        fill: '#563d7c',
        linkURL: 'https://en.wikipedia.org/wiki/CSS',
    },
    {
        name: 'HTML',
        value: 129,
        fill: '#e34c26',
        linkURL: 'https://en.wikipedia.org/wiki/HTML',
    },
    {
        name: 'Julia',
        value: 40,
        fill: '#268ee3',
        linkURL: 'https://en.wikipedia.org/wiki/Julia',
    },
    {
        name: 'Rust',
        value: 35,
        fill: '#e37b26',
        linkURL: 'https://en.wikipedia.org/wiki/rust',
    },
    {
        name: 'C#',
        value: 32,
        fill: '#ad26e3',
        linkURL: 'https://en.wikipedia.org/wiki/c#',
    },
    {
        name: 'C++',
        value: 30,
        fill: '#e32626',
        linkURL: 'https://en.wikipedia.org/wiki/c++',
    },
    {
        name: 'Markdown',
        value: 20,
        fill: '#083fa1',
        linkURL: 'https://en.wikipedia.org/wiki/Markdown',
    },
]

const ManyGroupsPieChartExample = () => {
    const { t } = useTranslation('../../wildcard/src/components/Charts/components/pie-chart')

    return (
        <section style={{ flexBasis: 0 }}>
            <H2>{t('many-arcs-example')}</H2>

            <Text>{t('tooltip-for-many-arcs')}</Text>

            <PieChart<LanguageUsageDatum>
                width={400}
                height={400}
                data={MANY_LANGUAGES_DATA}
                getDatumName={getName}
                getDatumValue={getValue}
                getDatumColor={getColor}
                getDatumLink={getLink}
            />
        </section>
    )
}
