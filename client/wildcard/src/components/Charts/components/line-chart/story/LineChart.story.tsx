import { useState } from 'react'

import type { Meta, StoryFn } from '@storybook/react'
import { ParentSize } from '@visx/responsive'
import { useTranslation } from 'react-i18next'
import { ResizableBox } from 'react-resizable'

import { BrandedStory } from '../../../../../stories/BrandedStory'
import { Badge } from '../../../../Badge'
import { Button } from '../../../../Button'
import { H2, Text, Code } from '../../../../Typography'
import type { Series } from '../../../types'
import { LineChart, LegendList, LegendItem, getLineColor } from '../index'

import {
    FLAT_SERIES,
    STANDARD_SERIES,
    SERIES_WITH_HUGE_DATA,
    UNALIGNED_SERIES,
    type StandardDatum,
    FLAT_XY_SERIES,
} from './mocks'

const StoryConfig: Meta = {
    title: 'wildcard/Charts',
    decorators: [story => <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>],
    parameters: {
        chromatic: { disableSnapshots: false, enableDarkMode: true },
    },
}

export default StoryConfig

export const LineChartsDemo: StoryFn = () => (
    <main
        style={{
            display: 'flex',
            flexWrap: 'wrap',
            rowGap: 40,
            columnGap: 20,
            paddingBottom: 40,
        }}
    >
        <PlainChartExample />
        <FlatChartExample />
        <PlainStackedChartExample />
        <ResponsiveChartExample />
        <WithLegendExample />
        <WithHugeDataExample />
        <WithZeroOneDataExample />
        <StackedWithDataMissingValues />
    </main>
)

const PlainChartExample = () => {
    const { t } = useTranslation('../../wildcard/src/components/Charts/components/line-chart/story')

    const [active, setActive] = useState(false)

    return (
        <section style={{ flexBasis: 0 }}>
            <H2>{t('plain-chart')}</H2>

            <Text>{t('line-chart-standard-example')}</Text>

            <Button variant="primary" size="sm" className="mb-2" onClick={() => setActive(!active)}>
                {t('start-y-axis-zero')}
            </Button>

            <LineChart width={400} height={400} zeroYAxisMin={active} series={FLAT_SERIES} />
        </section>
    )
}

const FlatChartExample = () => {
    const { t } = useTranslation('../../wildcard/src/components/Charts/components/line-chart/story')

    return (
        <section style={{ flexBasis: 0 }}>
            <H2>{t('flat-chart')}</H2>

            <Text>{t('line-chart-flat-datasets')}</Text>

            <LineChart width={400} height={400} series={FLAT_XY_SERIES} />
        </section>
    )
}

const PlainStackedChartExample = () => {
    const { t } = useTranslation('../../wildcard/src/components/Charts/components/line-chart/story')

    const [active, setActive] = useState(false)

    return (
        <section style={{ flexBasis: 0 }}>
            <H2>{t('plain-stacked-chart')}</H2>

            <Text>
                <Badge variant="merged">{t('experimental')}</Badge>
                {t('stacked-line-chart-description')}
            </Text>

            <Button variant="primary" size="sm" className="mb-2" onClick={() => setActive(!active)}>
                {t('start-y-axis-zero-2')}
            </Button>

            <LineChart stacked={true} width={400} height={400} series={STANDARD_SERIES} zeroYAxisMin={active} />
        </section>
    )
}

const ResponsiveChartExample = () => {
    const { t } = useTranslation('../../wildcard/src/components/Charts/components/line-chart/story')

    return (
        <section style={{ flexBasis: 0 }}>
            <H2>{t('responsive-chart')}</H2>

            <Text style={{ maxWidth: 400, minWidth: 400 }}>
                {t('svg-chart-resize')}
                <br />
                <br />
                {t('resize-logic-note')}
            </Text>

            <ResizableBox width={400} height={400} axis="both" minConstraints={[200, 200]} className="p-3">
                <ParentSize debounceTime={0}>
                    {parent => <LineChart width={parent.width} height={parent.height} series={STANDARD_SERIES} />}
                </ParentSize>
            </ResizableBox>
        </section>
    )
}

const WithLegendExample = () => {
    const { t } = useTranslation('../../wildcard/src/components/Charts/components/line-chart/story')

    return (
        <section style={{ flexBasis: 0 }}>
            <H2>{t('line-chart-with-legend')}</H2>

            <Text>{t('chart-layout-fixed-size')}</Text>

            <div className="d-flex flex-column" style={{ width: 400, height: 400 }}>
                <ParentSize className="flex-1">
                    {({ width, height }) => <LineChart width={width} height={height} series={STANDARD_SERIES} />}
                </ParentSize>
                <LegendList className="mt-2">
                    {STANDARD_SERIES.map(line => (
                        <LegendItem key={line.id} color={getLineColor(line)} name={line.name} />
                    ))}
                </LegendList>
            </div>
        </section>
    )
}

const WithHugeDataExample = () => {
    const { t } = useTranslation('../../wildcard/src/components/Charts/components/line-chart/story')

    return (
        <section style={{ flexBasis: 0 }}>
            <H2>{t('unaligned-data-series')}</H2>

            <Text>{t('tooltip-existing-points')}</Text>

            <LineChart width={400} height={400} series={SERIES_WITH_HUGE_DATA} />
        </section>
    )
}

const WithZeroOneDataExample = () => {
    const { t } = useTranslation('../../wildcard/src/components/Charts/components/line-chart/story')

    const SERIES: Series<StandardDatum>[] = [
        {
            id: 'series_001',
            data: [
                { x: new Date(2022, 6, 1), value: 0 },
                { x: new Date(2022, 6, 3), value: 5 },
            ],
            name: 'A metric',
            color: 'var(--blue)',
            getXValue: datum => new Date(datum.x),
            getYValue: datum => datum.value,
        },
    ]

    return (
        <section style={{ flexBasis: 0 }}>
            <H2>{t('short-datasets')}</H2>

            <Text>
                <Badge variant="warning">{t('improvement-needed')}</Badge>
                {t('line-charts-short-datasets-issue')}
            </Text>

            <LineChart width={400} height={400} series={SERIES} />
        </section>
    )
}

const StackedWithDataMissingValues = () => {
    const { t } = useTranslation('../../wildcard/src/components/Charts/components/line-chart/story')

    return (
        <section style={{ flexBasis: 0 }}>
            <H2>{t('unaligned-stacked-datasets')}</H2>

            <Text>
                <Badge variant="merged">{t('experimental-2')}</Badge>
                {t('interpolation-unaligned-datasets')}
                <br />
                <Code>
                    {t('x-axis-label')}
                    <br />
                    -----|----- <br />
                    {t('series-labels')}
                    <br />
                    {t('interpolation-formula')}
                </Code>
            </Text>

            <LineChart stacked={true} width={400} height={400} series={UNALIGNED_SERIES} />
        </section>
    )
}
