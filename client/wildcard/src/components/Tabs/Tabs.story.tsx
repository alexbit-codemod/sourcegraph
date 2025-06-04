import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { H1, H2 } from '..'
import { BrandedStory } from '../../stories/BrandedStory'

import { Tabs, Tab, TabList, TabPanel, TabPanels, type TabsProps } from '.'

export const TabsStory: StoryFn<TabsProps & { actions: boolean }> = args => {
    const { t } = useTranslation('../../wildcard/src/components/Tabs')

    return (
        <>
            <H1>{t('tabs-title')}</H1>
            <Container title="Standard">
                <TabsVariant {...args} />
            </Container>
            <Container width={300} title="Limited width">
                <TabsVariant {...args} />
            </Container>
            <Container width={300} title="Scrolled tab list">
                <TabsVariant {...args} longTabList="scroll" />
            </Container>
        </>
    )
}

TabsStory.storyName = 'Tabs component'

const config: Meta = {
    title: 'wildcard/Tabs',
    component: Tabs,
    decorators: [story => <BrandedStory>{() => story()}</BrandedStory>],
    parameters: {
        chromatic: {
            enableDarkMode: true,
            disableSnapshot: false,
        },
        design: [
            {
                type: 'figma',
                name: 'Figma Light',
                url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Design-Refresh-Systemization-source-of-truth?node-id=954%3A5153',
            },
            {
                type: 'figma',
                name: 'Figma Dark',
                url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=954%3A6125',
            },
        ],
    },
    argTypes: {
        size: {
            options: ['small', 'medium', 'large'],
            control: { type: 'radio' },
        },
        lazy: {
            options: [true, false],
            control: { type: 'radio' },
        },
        behavior: {
            options: ['memoize', 'forceRender'],
            control: { type: 'radio' },
        },
        actions: {
            options: [true, false],
            control: { type: 'radio' },
        },
    },
}

const TabsVariant: StoryFn<TabsProps & { actions: boolean }> = args => {
    const { t } = useTranslation('../../wildcard/src/components/Tabs')

    const { actions, lazy, behavior, size, ...props } = args
    return (
        <Tabs lazy={lazy} behavior={behavior} size={size} {...props}>
            <TabList actions={actions ? <div>{t('custom-component-rendered')}</div> : null}>
                <Tab>{t('tab-1')}</Tab>
                <Tab>{t('tab-2')}</Tab>
                <Tab>{t('third-tab')}</Tab>
                <Tab>{t('fourth-tab')}</Tab>
                <Tab>{t('fifth-tab')}</Tab>
                <Tab>{t('sixth-tab')}</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>{t('panel-1')}</TabPanel>
                <TabPanel>{t('panel-2')}</TabPanel>
                <TabPanel>{t('panel-3')}</TabPanel>
                <TabPanel>{t('panel-4')}</TabPanel>
                <TabPanel>{t('panel-5')}</TabPanel>
                <TabPanel>{t('panel-6')}</TabPanel>
            </TabPanels>
        </Tabs>
    )
}

interface ContainerProps {
    title: string
    width?: number
}

const Container: React.FunctionComponent<React.PropsWithChildren<ContainerProps>> = ({ title, width, children }) => (
    <>
        <H2 style={{ margin: '30px 0 10px 0' }}>{title}</H2>
        <div style={{ width: width ? `${width}px` : undefined }}>{children}</div>
    </>
)

export default config
