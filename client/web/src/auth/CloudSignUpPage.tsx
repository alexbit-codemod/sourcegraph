import React from 'react'

import { mdiArrowExpandAll, mdiChevronLeft, mdiMessageReplyText, mdiMicrosoftVisualStudioCode } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { useQuery } from '@sourcegraph/http-client'
import { UserAvatar } from '@sourcegraph/shared/src/components/UserAvatar'
import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { Link, Icon, H2 } from '@sourcegraph/wildcard'

import { BrandLogo } from '../components/branding/BrandLogo'
import type { UserAreaUserProfileResult, UserAreaUserProfileVariables } from '../graphql-operations'
import type { SourcegraphContext } from '../jscontext'
import { USER_AREA_USER_PROFILE } from '../user/area/UserArea'

import { ExternalsAuth } from './components/ExternalsAuth'
import { FeatureList } from './components/FeatureList'
import { type SignUpArguments, SignUpForm } from './SignUpForm'

import styles from './CloudSignUpPage.module.scss'

interface Props extends TelemetryProps, TelemetryV2Props {
    source: string | null
    showEmailForm: boolean
    /** Called to perform the signup on the server. */
    onSignUp: (args: SignUpArguments) => Promise<void>
    context: Pick<SourcegraphContext, 'externalURL' | 'authPasswordPolicy' | 'authMinPasswordLength'>
    isSourcegraphDotCom: boolean
    isLightTheme: boolean
}

const SourceToTitleMap = {
    AI: 'Sign up for access to an AI code assistant with the context of millions of public repositories.',
    Context: 'Easily search the code you care about.',
    Saved: 'Create a library of useful searches.',
    Monitor: 'Monitor code for changes.',
    Extend: 'Augment code and workflows via extensions.',
    SearchCTA: 'Easily search the code you care about.',
    HomepageCTA: 'Easily search the code you care about.',
    Snippet: 'Easily search the code you care about.',
}

export type CloudSignUpSource = keyof typeof SourceToTitleMap

export const ShowEmailFormQueryParameter = 'showEmail'

/**
 * Sign up page specifically for Sourcegraph.com
 */
export const CloudSignUpPage: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    isLightTheme,
    source,
    showEmailForm,
    onSignUp,
    context,
    telemetryService,
    telemetryRecorder,
    isSourcegraphDotCom,
}) => {
    const { t } = useTranslation('auth')

    const location = useLocation()

    const queryWithUseEmailToggled = new URLSearchParams(location.search)
    if (showEmailForm) {
        queryWithUseEmailToggled.delete(ShowEmailFormQueryParameter)
    } else {
        queryWithUseEmailToggled.append(ShowEmailFormQueryParameter, 'true')
    }

    const assetsRoot = window.context?.assetsRoot || ''
    const sourceIsValid = source && Object.keys(SourceToTitleMap).includes(source)
    const defaultTitle = SourceToTitleMap.AI
    const title = sourceIsValid ? SourceToTitleMap[source as CloudSignUpSource] : defaultTitle

    const invitedBy = queryWithUseEmailToggled.get('invitedBy')
    const { data } = useQuery<UserAreaUserProfileResult, UserAreaUserProfileVariables>(USER_AREA_USER_PROFILE, {
        variables: { username: invitedBy || '', isSourcegraphDotCom },
        skip: !invitedBy,
    })
    const invitedByUser = data?.user

    const signUpForm = (
        <SignUpForm
            onSignUp={args => onSignUp(args)}
            context={{
                authProviders: [],
                authMinPasswordLength: context.authMinPasswordLength,
                sourcegraphDotComMode: true,
            }}
            buttonLabel={t('sign-up')}
            experimental={true}
            className="my-3"
            telemetryRecorder={telemetryRecorder}
        />
    )

    const renderCodeHostAuth = (): JSX.Element => (
        <>
            <ExternalsAuth
                page="cloud-signup-page"
                context={context}
                githubLabel={t('continue-with-github')}
                gitlabLabel={t('continue-with-gitlab')}
                googleLabel={t('continue-with-google')}
                onClick={() => {}}
                telemetryRecorder={telemetryRecorder}
                telemetryService={telemetryService}
            />
        </>
    )

    const renderEmailAuthForm = (): JSX.Element => (
        <>
            <small className="d-block mt-3">
                <Link
                    className="d-flex align-items-center"
                    to={`${location.pathname}?${queryWithUseEmailToggled.toString()}`}
                >
                    <Icon className={styles.backIcon} aria-hidden={true} svgPath={mdiChevronLeft} />
                    {t('go-back')}
                </Link>
            </small>

            {signUpForm}
        </>
    )

    const renderAuthMethod = (): JSX.Element => (showEmailForm ? renderEmailAuthForm() : renderCodeHostAuth())

    return (
        <div className={styles.page}>
            <div className={classNames('d-flex', 'justify-content-center', 'mb-5', styles.leftOrRightContainer)}>
                <div className={styles.leftOrRight}>
                    <BrandLogo isLightTheme={isLightTheme} variant="logo" className={styles.logo} />
                    <H2
                        className={classNames(
                            'd-flex',
                            'align-items-center',
                            'mb-4',
                            'mt-1',
                            'text-wrap',
                            invitedBy ? styles.pageHeadingInvitedBy : styles.pageHeading
                        )}
                    >
                        {invitedByUser ? (
                            <>
                                <UserAvatar
                                    inline={true}
                                    className={classNames('mr-3', styles.avatar)}
                                    user={invitedByUser}
                                />
                                <Trans
                                    i18nKey="invitation-message"
                                    values={{ invitedBy: <>{invitedBy}</> }}
                                    components={{ '0': <strong className="mr-1" /> }}
                                />
                            </>
                        ) : (
                            title
                        )}
                    </H2>
                    <FeatureList>
                        <FeatureList.Item icon={mdiMessageReplyText} title={t('ai-assistant-description')}>
                            {t('cody-functionality-description')}
                        </FeatureList.Item>
                        <FeatureList.Item icon={mdiArrowExpandAll} title={t('codebase-aware-chat')}>
                            {t('local-code-awareness')}
                        </FeatureList.Item>
                        <FeatureList.Item icon={mdiMicrosoftVisualStudioCode} title={t('get-access-to-cody')}>
                            {t('free-access-signup')}
                        </FeatureList.Item>
                    </FeatureList>
                    <div className={styles.companiesHeader}>{t('trusted-by-developers')}</div>
                    <img
                        src={`${assetsRoot}/img/customer-logos-${isLightTheme ? 'light' : 'dark'}.svg`}
                        alt={t('trusted-companies')}
                        className={styles.customerLogos}
                    />
                </div>

                <div className={classNames(styles.leftOrRight, styles.signUpWrapper)}>
                    <H2>{t('create-free-account')}</H2>
                    {renderAuthMethod()}

                    <small className="text-muted">
                        <Trans
                            i18nKey="terms-and-privacy-agreement"
                            components={{
                                '0': <Link to="https://sourcegraph.com/terms" target="_blank" rel="noopener" />,
                                '1': <Link to="https://sourcegraph.com/privacy" target="_blank" rel="noopener" />,
                            }}
                        />
                    </small>

                    <hr className={styles.separator} />

                    <div>
                        <Trans
                            i18nKey="already-have-account"
                            components={{ '0': <Link to={`/sign-in${location.search}`} /> }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
