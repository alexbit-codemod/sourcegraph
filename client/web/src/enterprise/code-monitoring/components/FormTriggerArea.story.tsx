import type { Meta, StoryFn } from '@storybook/react'
import { useTranslation } from 'react-i18next'
import sinon from 'sinon'

import { H2 } from '@sourcegraph/wildcard'

import { WebStory } from '../../../components/WebStory'

import { FormTriggerArea } from './FormTriggerArea'

import codeMonitorFormStyles from './CodeMonitorForm.module.scss'

const config: Meta = {
    title: 'web/enterprise/code-monitoring/FormTrigerArea',
    parameters: {
        design: {
            type: 'Figma',
            url: 'https://www.figma.com/file/Krh7HoQi0GFxtO2k399ZQ6/RFC-227-%E2%80%93-Code-monitoring-actions-and-notifications?node-id=3891%3A41568',
        },
        chromatic: {
            delay: 600, // Delay screenshot for input validation debouncing
            viewports: [720],
            disableSnapshot: false,
        },
    },
}

export default config

export const FormTrigerArea: StoryFn = () => (
    <WebStory>
        {props => {
            const { t } = useTranslation('enterprise/code-monitoring/components')

            return (
                <>
                    <H2>{t('closed-empty-query')}</H2>
                    <div className="my-2">
                        <FormTriggerArea
                            {...props}
                            query=""
                            triggerCompleted={false}
                            onQueryChange={sinon.fake()}
                            setTriggerCompleted={sinon.fake()}
                            startExpanded={false}
                            cardBtnClassName={codeMonitorFormStyles.cardButton}
                            cardLinkClassName={codeMonitorFormStyles.cardLink}
                            cardClassName={codeMonitorFormStyles.card}
                            isSourcegraphDotCom={false}
                        />
                    </div>

                    <H2>{t('open-empty-query')}</H2>
                    <div className="my-2">
                        <FormTriggerArea
                            {...props}
                            query=""
                            triggerCompleted={false}
                            onQueryChange={sinon.fake()}
                            setTriggerCompleted={sinon.fake()}
                            startExpanded={true}
                            cardBtnClassName={codeMonitorFormStyles.cardButton}
                            cardLinkClassName={codeMonitorFormStyles.cardLink}
                            cardClassName={codeMonitorFormStyles.card}
                            isSourcegraphDotCom={false}
                        />
                    </div>

                    <H2>{t('open-partially-valid-query')}</H2>
                    <div className="my-2">
                        <FormTriggerArea
                            {...props}
                            query="test type:commit"
                            triggerCompleted={false}
                            onQueryChange={sinon.fake()}
                            setTriggerCompleted={sinon.fake()}
                            startExpanded={true}
                            cardBtnClassName={codeMonitorFormStyles.cardButton}
                            cardLinkClassName={codeMonitorFormStyles.cardLink}
                            cardClassName={codeMonitorFormStyles.card}
                            isSourcegraphDotCom={false}
                        />
                    </div>

                    <H2>{t('open-fully-valid-query')}</H2>
                    <div className="my-2">
                        <FormTriggerArea
                            {...props}
                            query="test type:commit repo:test"
                            triggerCompleted={false}
                            onQueryChange={sinon.fake()}
                            setTriggerCompleted={sinon.fake()}
                            startExpanded={true}
                            cardBtnClassName={codeMonitorFormStyles.cardButton}
                            cardLinkClassName={codeMonitorFormStyles.cardLink}
                            cardClassName={codeMonitorFormStyles.card}
                            isSourcegraphDotCom={false}
                        />
                    </div>
                </>
            )
        }}
    </WebStory>
)

FormTrigerArea.storyName = 'FormTrigerArea'
