import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { useTranslation, Trans } from 'react-i18next'

import { Link } from '@sourcegraph/wildcard'

import { WebStory } from '../WebStory'

import { DismissibleAlert } from './DismissibleAlert'

const decorator: Decorator = story => <WebStory>{() => story()}</WebStory>

const config: Meta = {
    title: 'web/DismissibleAlert',
    decorators: [decorator],
}

export default config

export const OneLineAlert: StoryFn = () => {
    const { t } = useTranslation('components/DismissibleAlert')

    return (
        <DismissibleAlert variant="info" partialStorageKey="dismissible-alert-one-line">
            <span>
                <Trans i18nKey="bulk-operation-failed-notification" components={{ '0': <Link to="?" /> }} />
            </span>
        </DismissibleAlert>
    )
}

OneLineAlert.storyName = 'One-line alert'

export const MultilineAlert: StoryFn = () => {
    const { t } = useTranslation('components/DismissibleAlert')

    return (
        <DismissibleAlert variant="info" partialStorageKey="dismissible-alert-multiline">
            {t('webassembly-overview')}
        </DismissibleAlert>
    )
}

MultilineAlert.storyName = 'Multiline alert'
