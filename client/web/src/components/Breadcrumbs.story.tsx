import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation, Trans } from 'react-i18next'

import { Link } from '@sourcegraph/wildcard'

import { Breadcrumbs } from './Breadcrumbs'
import { WebStory } from './WebStory'

const decorator: Decorator = story => <div className="container mt-3">{story()}</div>

const config: Meta = {
    title: 'web/Breadcrumbs',
    decorators: [decorator],
}

export default config

export const Example: StoryFn = () => (
    <WebStory>
        {webProps => {
            const { t } = useTranslation('components')

            return (
                <Breadcrumbs
                    {...webProps}
                    breadcrumbs={[
                        {
                            depth: 0,
                            breadcrumb: { key: 'home', element: <Link to="/">{t('home')}</Link>, divider: null },
                        },
                        {
                            depth: 1,
                            breadcrumb: { key: 'repo_area', element: <Link to="/">{t('repositories')}</Link> },
                        },
                        {
                            depth: 2,
                            breadcrumb: {
                                key: 'repo',
                                element: (
                                    <Link to="/">
                                        <Trans
                                            i18nKey="sourcegraph-with-span"
                                            components={{ '0': <span className="font-weight-medium" /> }}
                                        />
                                    </Link>
                                ),
                            },
                        },
                        {
                            depth: 3,
                            breadcrumb: {
                                key: 'revision',
                                divider: <span className="mx-1">@</span>,
                                element: <span className="text-muted">{t('branch-name')}</span>,
                            },
                        },
                        {
                            depth: 4,
                            breadcrumb: { key: 'directory1', element: <Link to="/">{t('path')}</Link> },
                        },
                        {
                            depth: 5,
                            breadcrumb: {
                                key: 'directory2',
                                divider: <span className="mx-1">/</span>,
                                element: <Link to="/">{t('to')}</Link>,
                            },
                        },
                        {
                            depth: 6,
                            breadcrumb: {
                                key: 'fileName',
                                divider: <span className="mx-1">/</span>,
                                element: <Link to="/">file.tsx</Link>,
                            },
                        },
                    ]}
                />
            )
        }}
    </WebStory>
)

Example.parameters = {
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/BkY8Ak997QauG0Iu2EqArv/Sourcegraph-Components?node-id=230%3A83',
    },
}
