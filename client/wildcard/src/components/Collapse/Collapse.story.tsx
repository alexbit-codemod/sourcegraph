import { useCallback, useState } from 'react'

import { mdiChevronDown, mdiChevronLeft } from '@mdi/js'
import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { H2 } from '..'
import { BrandedStory } from '../../stories/BrandedStory'
import { Button } from '../Button'
import { Input } from '../Form'
import { Icon } from '../Icon'

import { Collapse, CollapseHeader, CollapsePanel } from './Collapse'

const decorator: Decorator = story => (
    <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>
)

const config: Meta = {
    title: 'wildcard/Collapse',
    component: Collapse,

    decorators: [decorator],
}

export default config

export const Simple: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Collapse')

    const [isOpened, setIsOpened] = useState(false)

    const handleOpenChange = useCallback((next: boolean) => {
        setIsOpened(next)
    }, [])

    return (
        <div>
            <H2 className="my-3">{t('controlled-collapse')}</H2>
            <Collapse isOpen={isOpened} onOpenChange={handleOpenChange}>
                <CollapseHeader as={Button} outline={true} focusLocked={true} variant="secondary" className="w-50">
                    {t('collapsable-message-1')}
                    <Icon aria-hidden={true} svgPath={isOpened ? mdiChevronDown : mdiChevronLeft} className="mr-1" />
                </CollapseHeader>
                <CollapsePanel className="w-50">
                    <Input placeholder={t('testing-quote-1')} />
                </CollapsePanel>
            </Collapse>

            <H2 className="my-3">{t('uncontrolled-collapse')}</H2>
            <Collapse>
                {({ isOpen }) => {
                    const { t } = useTranslation('../../wildcard/src/components/Collapse')

                    return (
                        <>
                            <CollapseHeader
                                as={Button}
                                aria-label={isOpen ? 'Expand' : 'Collapse'}
                                outline={true}
                                variant="secondary"
                                className="w-50"
                            >
                                {t('collapsable-message-2')}
                                <Icon
                                    aria-hidden={true}
                                    svgPath={isOpen ? mdiChevronDown : mdiChevronLeft}
                                    className="mr-1"
                                />
                            </CollapseHeader>
                            <CollapsePanel className="w-50">
                                <Input placeholder={t('testing-quote-2')} />
                            </CollapsePanel>
                        </>
                    )
                }}
            </Collapse>

            <H2 className="my-3">{t('open-by-default-collapse')}</H2>
            <Collapse openByDefault={true}>
                {({ isOpen }) => {
                    const { t } = useTranslation('../../wildcard/src/components/Collapse')

                    return (
                        <>
                            <CollapseHeader
                                as={Button}
                                aria-label={isOpen ? 'Expand' : 'Collapse'}
                                outline={true}
                                variant="secondary"
                                className="w-50"
                            >
                                {t('collapsable-message-3')}
                                <Icon
                                    aria-hidden={true}
                                    svgPath={isOpen ? mdiChevronDown : mdiChevronLeft}
                                    className="mr-1"
                                />
                            </CollapseHeader>
                            <CollapsePanel className="w-50">
                                <Input placeholder={t('testing-quote-3')} />
                            </CollapsePanel>
                        </>
                    )
                }}
            </Collapse>

            <H2 className="my-3">{t('without-forced-collapse-panel')}</H2>
            <Collapse>
                {({ isOpen }) => {
                    const { t } = useTranslation('../../wildcard/src/components/Collapse')

                    return (
                        <>
                            <CollapseHeader
                                as={Button}
                                aria-label={isOpen ? 'Expand' : 'Collapse'}
                                outline={true}
                                variant="secondary"
                                className="w-50"
                            >
                                {t('collapsable-message-4')}
                                <Icon
                                    aria-hidden={true}
                                    svgPath={isOpen ? mdiChevronDown : mdiChevronLeft}
                                    className="mr-1"
                                />
                            </CollapseHeader>
                            <CollapsePanel forcedRender={false} className="w-50">
                                <Input placeholder={t('testing-quote-4')} />
                            </CollapsePanel>
                        </>
                    )
                }}
            </Collapse>
        </div>
    )
}
