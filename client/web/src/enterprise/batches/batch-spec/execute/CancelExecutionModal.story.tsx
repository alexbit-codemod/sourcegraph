import type { Decorator, Meta, StoryFn } from '@storybook/react'
import { noop } from 'lodash'
import { useTranslation } from 'react-i18next'

import { Text } from '@sourcegraph/wildcard'

import { WebStory } from '../../../../components/WebStory'

import { CancelExecutionModal } from './CancelExecutionModal'

const decorator: Decorator = story => <div className="p-3 container">{story()}</div>

const config: Meta = {
    title: 'web/batches/batch-spec/execute',
    decorators: [decorator],
    argTypes: {
        isLoading: {
            control: {
                type: 'boolean',
            },
        },
    },
    args: {
        isLoading: false,
    },
}

export default config

export const CancelExecutionModalStory: StoryFn = args => (
    <WebStory>
        {props => {
            const { t } = useTranslation('enterprise/batches/batch-spec/execute')

            return (
                <CancelExecutionModal
                    {...props}
                    modalBody={<Text>{t('cancel-current-execution-confirmation')}</Text>}
                    isOpen={true}
                    isLoading={args.isLoading}
                    onCancel={noop}
                    onConfirm={noop}
                />
            )
        }}
    </WebStory>
)

CancelExecutionModalStory.storyName = 'CancelExecutionModal'
