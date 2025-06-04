import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { H1, H2, H3, Text, Input } from '..'
import { BrandedStory } from '../../stories/BrandedStory'
import { Alert } from '../Alert'
import { Button } from '../Button'

import { Container } from './Container'

const decorator: Decorator = story => (
    <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>
)

const config: Meta = {
    title: 'wildcard/Container',
    component: Container,
    decorators: [decorator],
}

export default config

export const Overview: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Container')

    return (
        <>
            <Alert variant="info">
                <Text>{t('container-grouping-content')}</Text>
                <Text>{t('button-context')}</Text>
                <ul className="mb-0">
                    <li>{t('button-outside-container')}</li>
                    <li>{t('button-inside-container')}</li>
                </ul>
            </Alert>
            <hr />
            <H1>{t('example-1')}</H1>
            <H2>{t('page-explanation')}</H2>
            <Text className="text-muted">{t('optional-page-description')}</Text>
            <Container className="mb-3">
                <H3>{t('section-i')}</H3>
                <Text>{t('change-username')}</Text>
                <div className="form-group">
                    <Input />
                </div>
                <H3>{t('section-ii')}</H3>
                <Text>{t('change-email')}</Text>
                <div className="form-group mb-0">
                    <Input type="email" />
                </div>
            </Container>
            <div className="mb-3">
                <Button variant="primary" className="mr-2">
                    {t('save-button')}
                </Button>
                <Button variant="secondary">{t('cancel-button')}</Button>
            </div>
            <hr />
            <H1>{t('example-2')}</H1>
            <H2>{t('page-explanation-2')}</H2>
            <Text className="text-muted">{t('optional-page-description-2')}</Text>
            <Container className="mb-3">
                <H3>{t('section-i-2')}</H3>
                <Text>{t('change-username-2')}</Text>
                <div className="form-group">
                    <Input />
                </div>
                <Button className="mb-2" variant="secondary">
                    {t('save-button-2')}
                </Button>
                <hr className="mb-2" />
                <H3>{t('section-ii-2')}</H3>
                <Text>{t('change-email-2')}</Text>
                <div className="form-group">
                    <Input type="email" />
                </div>
                <Button variant="secondary">{t('save-button-3')}</Button>
            </Container>
        </>
    )
}

Overview.parameters = {
    chromatic: {
        enableDarkMode: true,
        disableSnapshot: false,
    },
    design: {
        type: 'figma',
        name: 'Figma',
        url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/?node-id=1478%3A3044',
    },
}
