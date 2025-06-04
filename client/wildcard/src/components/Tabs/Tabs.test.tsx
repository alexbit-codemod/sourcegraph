import { render, type RenderResult, cleanup, fireEvent } from '@testing-library/react'
import { useTranslation } from 'react-i18next'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { Tab, TabList, TabPanel, TabPanels, Tabs, type TabsProps } from './Tabs'

const TabsTest = (props: TabsProps) => <Tabs {...props} />

const TabsChildren = () => {
    const { t } = useTranslation('../../wildcard/src/components/Tabs')

    return (
        <>
            <TabList>
                <Tab>{t('tab-1')}</Tab>
                <Tab>{t('tab-2')}</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>{t('panel-1')}</TabPanel>
                <TabPanel>{t('panel-2')}</TabPanel>
            </TabPanels>
        </>
    )
}

const TabsChildrenWithActions = () => {
    const { t } = useTranslation('../../wildcard/src/components/Tabs')

    return (
        <>
            <TabList actions={<div>{t('actions')}</div>}>
                <Tab>{t('tab-1-duplicate')}</Tab>
                <Tab>{t('tab-2-duplicate')}</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>{t('panel-1-duplicate')}</TabPanel>
                <TabPanel>{t('panel-2-duplicate')}</TabPanel>
            </TabPanels>
        </>
    )
}

describe('Tabs', () => {
    let queries: RenderResult

    const renderWithProps = (props: TabsProps): RenderResult => render(<TabsTest {...props} />)

    afterEach(cleanup)

    describe('Main component structure', () => {
        beforeEach(() => {
            queries = renderWithProps({ children: <TabsChildren />, lazy: false, size: 'medium' })
        })

        it('will render tabs children correctly', () => {
            expect(queries.getByTestId('wildcard-tabs')).toBeInTheDocument()
            expect(queries.getByTestId('wildcard-tab-list')).toBeInTheDocument()
            expect(queries.getByTestId('wildcard-tab-panel-list')).toBeInTheDocument()
        })

        it('will render the right amount of <Tab/> components', () => {
            const tabGroup = queries.getAllByTestId('wildcard-tab')
            for (const tab of tabGroup) {
                expect(tab).toBeInTheDocument()
            }
            expect(queries.getAllByTestId('wildcard-tab')).toHaveLength(2)
        })

        it('will render the right amount of <TabPanel/> components', () => {
            const tabPanelGroup = queries.getAllByTestId('wildcard-tab')
            for (const tab of tabPanelGroup) {
                expect(tab).toBeInTheDocument()
            }
            expect(queries.getAllByTestId('wildcard-tab-panel')).toHaveLength(2)
        })

        it('will not render actions prop as a component', () => {
            expect(queries.queryByText('Actions')).not.toBeInTheDocument()
        })
    })

    describe('with actions', () => {
        beforeEach(() => {
            queries = renderWithProps({
                children: <TabsChildrenWithActions />,
                lazy: true,
                behavior: 'forceRender',
                size: 'medium',
            })
        })

        it('will render actions prop as a component', () => {
            expect(queries.getByText('Actions')).toBeInTheDocument()
        })
    })

    describe('Lazy = true', () => {
        describe('Tabs with behavior = forceRender', () => {
            beforeEach(() => {
                queries = renderWithProps({
                    children: <TabsChildren />,
                    lazy: true,
                    behavior: 'forceRender',
                    size: 'medium',
                })
            })

            it('will render <TabPanel/> children each time associated <Tab>  is clicked', () => {
                fireEvent.click(queries.getAllByTestId('wildcard-tab')[0])
                expect(queries.getByText('Panel 1')).toBeInTheDocument()
                expect(queries.queryByText('Panel 2')).not.toBeInTheDocument()
                fireEvent.click(queries.getAllByTestId('wildcard-tab')[1])
                expect(queries.getByText('Panel 2')).toBeInTheDocument()
                expect(queries.queryByText('Panel 1')).not.toBeInTheDocument()
            })
        })

        describe('Tabs with behavior = memoize', () => {
            beforeEach(() => {
                queries = renderWithProps({
                    children: <TabsChildren />,
                    lazy: true,
                    behavior: 'memoize',
                    size: 'medium',
                })
            })

            it('will render and keep mounted <TabPanel/> children when <Tab> is clicked', () => {
                fireEvent.click(queries.getAllByTestId('wildcard-tab')[0])
                expect(queries.getByText('Panel 1')).toBeInTheDocument()
                expect(queries.queryByText('Panel 2')).not.toBeInTheDocument()
                fireEvent.click(queries.getAllByTestId('wildcard-tab')[1])
                expect(queries.getByText('Panel 2')).toBeInTheDocument()
                expect(queries.queryByText('Panel 1')).toBeInTheDocument()
            })

            it('will not render and keep unmounted <TabPanel/> children when <Tab> is not selected', () => {
                fireEvent.click(queries.getAllByTestId('wildcard-tab')[0])
                expect(queries.getByText('Panel 1')).toBeInTheDocument()
                expect(queries.queryByText('Panel 2')).not.toBeInTheDocument()
                fireEvent.click(queries.getAllByTestId('wildcard-tab')[1])
                expect(queries.getByText('Panel 2')).toBeInTheDocument()
                expect(queries.queryByText('Panel 1')).toBeInTheDocument()
            })
        })
    })

    describe('Lazy = false', () => {
        beforeEach(() => {
            queries = renderWithProps({ children: <TabsChildren />, lazy: false, size: 'medium' })
        })

        it('will render all <TabPanel/> children', () => {
            fireEvent.click(queries.getAllByTestId('wildcard-tab')[0])
            expect(queries.getByText('Panel 1')).toBeInTheDocument()
            expect(queries.queryByText('Panel 2')).toBeInTheDocument()
            fireEvent.click(queries.getAllByTestId('wildcard-tab')[1])
            expect(queries.getByText('Panel 2')).toBeInTheDocument()
            expect(queries.queryByText('Panel 1')).toBeInTheDocument()
        })
    })
})
