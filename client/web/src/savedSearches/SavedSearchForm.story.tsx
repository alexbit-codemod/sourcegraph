import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { WebStory } from '../components/WebStory'

import { SavedSearchForm, type SavedSearchFormProps } from './SavedSearchForm'

const config: Meta = {
    title: 'web/savedSearches/SavedSearchForm',
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

export default config

window.context.emailEnabled = true

const commonProps: SavedSearchFormProps = {
    isSourcegraphDotCom: false,
    submitLabel: 'Submit',
    title: 'Title',
    defaultValues: {},
    authenticatedUser: null,
    onSubmit: () => {},
    loading: false,
    error: null,
    namespace: {
        __typename: 'User',
        id: '',
        url: '',
    },
}

export const NewSavedSearch: StoryFn = () => (
    <WebStory>
        {webProps => {
            const { t } = useTranslation('savedSearches')

            return (
                <SavedSearchForm
                    {...webProps}
                    {...commonProps}
                    submitLabel={t('add-saved-search')}
                    title={t('add-saved-search-duplicate')}
                    defaultValues={{}}
                />
            )
        }}
    </WebStory>
)

NewSavedSearch.storyName = 'new saved search'

export const NotifcationsDisabled: StoryFn = () => (
    <WebStory>
        {webProps => {
            const { t } = useTranslation('savedSearches')

            return (
                <SavedSearchForm
                    {...webProps}
                    {...commonProps}
                    submitLabel={t('update-saved-search')}
                    title={t('manage-saved-search')}
                    defaultValues={{
                        id: '1',
                        description: 'Existing saved search',
                        query: 'test',
                        notify: false,
                    }}
                />
            )
        }}
    </WebStory>
)

NotifcationsDisabled.storyName = 'existing saved search, notifications disabled'

export const NotifcationsEnabled: StoryFn = () => (
    <WebStory>
        {webProps => {
            const { t } = useTranslation('savedSearches')

            return (
                <SavedSearchForm
                    {...webProps}
                    {...commonProps}
                    submitLabel={t('update-saved-search-duplicate')}
                    title={t('manage-saved-search-duplicate')}
                    defaultValues={{
                        id: '1',
                        description: 'Existing saved search',
                        query: 'test type:diff',
                        notify: true,
                    }}
                />
            )
        }}
    </WebStory>
)

NotifcationsEnabled.storyName = 'existing saved search, notifications enabled'

export const NotificationsEnabledWithInvalidQueryWarning: StoryFn = () => (
    <WebStory>
        {webProps => {
            const { t } = useTranslation('savedSearches')

            return (
                <SavedSearchForm
                    {...webProps}
                    {...commonProps}
                    submitLabel={t('update-saved-search-duplicate-2')}
                    title={t('manage-saved-search-duplicate-2')}
                    defaultValues={{
                        id: '1',
                        description: 'Existing saved search',
                        query: 'test',
                        notify: true,
                    }}
                />
            )
        }}
    </WebStory>
)

NotificationsEnabledWithInvalidQueryWarning.storyName =
    'existing saved search, notifications enabled, with invalid query warning'
