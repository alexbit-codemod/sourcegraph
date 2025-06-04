import type { Meta, StoryFn, Decorator } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { Combobox } from '@sourcegraph/wildcard'
import { BrandedStory } from '@sourcegraph/wildcard/src/stories'

import { SearchContextMenuItem } from './SearchContextMenu'

const decorator: Decorator = story => (
    <div className="dropdown-menu show" style={{ position: 'static' }}>
        {story()}
    </div>
)

const config: Meta = {
    title: 'branded/search-ui/input/SearchContextMenuItem',
    parameters: {
        chromatic: { viewports: [1200], disableSnapshot: false },
    },
    decorators: [decorator],
}

export default config

export const SelectedDefaultItem: StoryFn = () => (
    <BrandedStory>
        {() => {
            const { t } = useTranslation('../../branded/src/search-ui/input')

            return (
                <Combobox>
                    <SearchContextMenuItem
                        spec="@user/test"
                        description={t('default-description-1')}
                        query=""
                        selected={true}
                        isDefault={true}
                        starred={false}
                    />
                </Combobox>
            )
        }}
    </BrandedStory>
)

SelectedDefaultItem.storyName = 'selected default item'

export const StarredItem: StoryFn = () => (
    <BrandedStory>
        {() => {
            const { t } = useTranslation('../../branded/src/search-ui/input')

            return (
                <Combobox>
                    <SearchContextMenuItem
                        spec="@user/test"
                        description={t('default-description-2')}
                        query=""
                        selected={false}
                        isDefault={false}
                        starred={true}
                    />
                </Combobox>
            )
        }}
    </BrandedStory>
)

StarredItem.storyName = 'starred item'
