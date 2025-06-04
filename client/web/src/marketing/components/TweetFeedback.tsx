import * as React from 'react'

import { mdiTwitter } from '@mdi/js'
import { useTranslation } from 'react-i18next'

import { ButtonLink, Icon, Text } from '@sourcegraph/wildcard'

export interface TweetFeedbackProps {
    score: number
    feedback: string
}

const SCORE_TO_TWEET = 9

export const TweetFeedback: React.FunctionComponent<React.PropsWithChildren<TweetFeedbackProps>> = ({
    feedback,
    score,
}) => {
    const { t } = useTranslation('marketing/components')

    if (score >= SCORE_TO_TWEET) {
        const url = new URL('https://twitter.com/intent/tweet')
        url.searchParams.set('text', `After using @sourcegraph: ${feedback}`)
        return (
            <>
                <Text className="mt-2">{t('request-feedback-twitter')}</Text>
                <ButtonLink
                    className="d-inline-block mt-2"
                    to={url.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    variant="primary"
                >
                    <Icon className="mr-2" aria-hidden={true} svgPath={mdiTwitter} />
                    {t('tweet-feedback')}
                </ButtonLink>
            </>
        )
    }

    return null
}
