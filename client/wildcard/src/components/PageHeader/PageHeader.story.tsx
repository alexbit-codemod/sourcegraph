import { mdiMagnify, mdiPlus, mdiPuzzleOutline } from '@mdi/js'
import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation, Trans } from 'react-i18next'

import { BrandedStory } from '../../stories/BrandedStory'
import { Button } from '../Button'
import { FeedbackBadge } from '../Feedback'
import { Icon } from '../Icon'
import { Link } from '../Link'
import { H1, H2 } from '../Typography'

import { PageHeader } from './PageHeader'

const decorator: Decorator = story => (
    <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>
)

const config: Meta = {
    title: 'wildcard/PageHeader',
    component: PageHeader,
    decorators: [decorator],
}

export default config

export const BasicHeader: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/PageHeader')

    return (
        <>
            <H1>{t('page-header')}</H1>
            <H2>{t('basic')}</H2>
            <div className="mb-3">
                <PageHeader
                    path={[{ icon: mdiPuzzleOutline, text: 'Header' }]}
                    actions={
                        <Button to={`${location.pathname}/close`} className="mr-1" variant="secondary" as={Link}>
                            <Icon aria-hidden={true} svgPath={mdiMagnify} />
                            {t('button-with-icon')}
                        </Button>
                    }
                />
            </div>
            <H2>{t('overflowing')}</H2>
            <div className="mb-3">
                <PageHeader
                    path={[
                        {
                            icon: mdiPuzzleOutline,
                            text: 'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.',
                        },
                    ]}
                />
            </div>
        </>
    )
}

BasicHeader.storyName = 'Basic header'

BasicHeader.parameters = {
    design: {
        type: 'figma',
        name: 'Figma',
        url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Design-Refresh-Systemization-source-of-truth?node-id=1485%3A0',
    },
}

export const ComplexHeader: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/PageHeader')

    return (
        <PageHeader
            annotation={<FeedbackBadge status="experimental" feedback={{ mailto: 'support@sourcegraph.com' }} />}
            byline={
                <>
                    <Trans i18nKey="created-by-user" components={{ '0': <Link to="/page" /> }} />
                </>
            }
            description="Enter the description for your section here. This is useful on list and create pages."
            actions={
                <div className="d-flex">
                    <Button as={Link} to="/page" variant="secondary" className="mr-2">
                        {t('secondary')}
                    </Button>
                    <Button as={Link} to="/page" variant="primary" className="text-nowrap">
                        <Icon aria-hidden={true} svgPath={mdiPlus} />
                        {t('create')}
                    </Button>
                </div>
            }
        >
            <PageHeader.Heading as="h2" styleAs="h1">
                <PageHeader.Breadcrumb to="/level-0" icon={mdiPuzzleOutline} />
                <PageHeader.Breadcrumb to="/level-1">{t('level-1')}</PageHeader.Breadcrumb>
                <PageHeader.Breadcrumb>{t('level-2')}</PageHeader.Breadcrumb>
                <PageHeader.Breadcrumb>{t('level-3')}</PageHeader.Breadcrumb>
                <PageHeader.Breadcrumb>{t('level-4')}</PageHeader.Breadcrumb>
                <PageHeader.Breadcrumb>{t('level-5')}</PageHeader.Breadcrumb>
            </PageHeader.Heading>
        </PageHeader>
    )
}

ComplexHeader.storyName = 'Complex header'

ComplexHeader.parameters = {
    chromatic: {
        enableDarkMode: true,
        disableSnapshot: false,
    },
    design: {
        type: 'figma',
        name: 'Figma',
        url: 'https://www.figma.com/file/NIsN34NH7lPu04olBzddTw/Design-Refresh-Systemization-source-of-truth?node-id=1485%3A0',
    },
}
