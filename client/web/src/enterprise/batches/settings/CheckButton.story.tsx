import { action } from '@storybook/addon-actions'
import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'

import { WebStory } from '../../../components/WebStory'

import { CheckButton } from './CheckButton'

const config: Meta = {
    title: 'web/batches/settings/CheckButton',
}

export default config

export const Initial: StoryFn = () => (
    <WebStory>
        {props => {
            const { t } = useTranslation('enterprise/batches/settings')

            return (
                <CheckButton
                    {...props}
                    label={t('check-state-something-0')}
                    onClick={action('onClick')}
                    loading={false}
                />
            )
        }}
    </WebStory>
)

export const Checking: StoryFn = () => (
    <WebStory>
        {props => {
            const { t } = useTranslation('enterprise/batches/settings')

            return <CheckButton {...props} label={t('check-state-something-1')} onClick={() => {}} loading={true} />
        }}
    </WebStory>
)

export const Success: StoryFn = () => (
    <WebStory>
        {props => {
            const { t } = useTranslation('enterprise/batches/settings')

            return (
                <CheckButton
                    {...props}
                    label={t('check-state-something-2')}
                    onClick={() => {}}
                    loading={false}
                    successMessage="Credential is valid"
                />
            )
        }}
    </WebStory>
)

export const Failed: StoryFn = () => (
    <WebStory>
        {props => {
            const { t } = useTranslation('enterprise/batches/settings')

            return (
                <CheckButton
                    {...props}
                    label={t('check-state-something-3')}
                    onClick={() => {}}
                    loading={false}
                    failedMessage="The credential is not valid. Something went wrong when connecting to the code host"
                />
            )
        }}
    </WebStory>
)
