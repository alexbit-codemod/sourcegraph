import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { H1, H2, H3, Text } from '..'
import { BrandedStory } from '../../stories/BrandedStory'
import { Button } from '../Button'
import { Grid } from '../Grid'

import { Card, CardBody, CardFooter, CardHeader, CardSubtitle, CardText, CardTitle } from '.'

const config: Meta = {
    title: 'wildcard/Card',
    component: Card,

    decorators: [story => <BrandedStory>{() => <div className="container mt-3 pb-3">{story()}</div>}</BrandedStory>],

    parameters: {
        component: Card,
        chromatic: {
            enableDarkMode: true,
            disableSnapshot: false,
        },
        design: [
            {
                type: 'figma',
                name: 'Figma Light',
                url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=1172%3A285',
            },
            {
                type: 'figma',
                name: 'Figma Dark',
                url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Wildcard-Design-System?node-id=1172%3A558',
            },
        ],
    },
}

export default config

export const Simple: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Card')

    return (
        <>
            <H1>{t('cards-title')}</H1>
            <Text>{t('card-description')}</Text>

            <H2>{t('examples-title')}</H2>

            <Grid className="mb-3" columnCount={1}>
                <Card>
                    <CardBody>{t('card-body-text')}</CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <CardTitle>{t('card-title')}</CardTitle>
                        <CardSubtitle>{t('card-subtitle')}</CardSubtitle>
                        <CardText>{t('card-content-description')}</CardText>
                        <Button variant="primary">{t('do-something-action')}</Button>
                    </CardBody>
                    <CardFooter>{t('card-footer')}</CardFooter>
                </Card>

                <Card>
                    <CardHeader>{t('featured-title')}</CardHeader>
                    <CardBody>
                        <CardTitle>{t('special-title-treatment')}</CardTitle>
                        <CardText>{t('supporting-text-lead-in')}</CardText>
                        <Button variant="primary">{t('do-something-action-duplicate')}</Button>
                    </CardBody>
                    <CardFooter>{t('card-footer-duplicate')}</CardFooter>
                </Card>
            </Grid>
        </>
    )
}

const cardItem = (
    <Card as="button" className="mb-1 p-0 w-100">
        <CardBody className="w-100 d-flex justify-content-between align-items-center">
            <div className="d-flex flex-column">
                <CardTitle className="mb-0 text-left">Watch for secrets in new commits</CardTitle>
                <CardSubtitle>New search result → Sends email notifications, delivers webhook</CardSubtitle>
            </div>
            <div className="d-flex align-items-center">
                <Button variant="link">Edit</Button>
            </div>
        </CardBody>
    </Card>
)

export const InteractiveCard: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Card')

    return (
        <>
            <H2>{t('interactive-cards-title')}</H2>
            {cardItem}

            <H3 className="mt-4">{t('cards-list-title')}</H3>

            <div className="d-flex flex-column">
                {cardItem}
                {cardItem}
                {cardItem}
                {cardItem}
            </div>
        </>
    )
}
