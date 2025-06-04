import * as React from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { Link } from '../../Link'
import { Text } from '../../Typography'

interface FeedbackTextProps {
    /**
     * @default "Questions/feedback?"
     */
    headerText?: React.ReactNode
    footerText?: React.ReactNode
    className?: string
}

/**
 * An abstract UI component which renders a text for feedback.
 */
export const FeedbackText: React.FunctionComponent<React.PropsWithChildren<FeedbackTextProps>> = ({
    className,
    footerText,
    headerText,
}) => {
    const { t } = useTranslation('../../wildcard/src/components/Feedback/FeedbackText')

    return (
        <Text className={className}>
            <Trans
                i18nKey="contact-us-questions-feedback"
                values={{ headerTextQuestionsFeedback: headerText || 'Questions/feedback?', footerText }}
                components={{
                    '0': <Link to="https://twitter.com/sourcegraph" target="_blank" rel="noopener noreferrer" />,
                    '1': <Link to="mailto:support@sourcegraph.com" target="_blank" rel="noopener noreferrer" />,
                    '2': (
                        <Link
                            to="https://github.com/sourcegraph/issues/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                    ),
                }}
            />
        </Text>
    )
}
