import React, { useCallback, useEffect } from 'react'

import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { logger } from '@sourcegraph/common'
import { gql, useMutation, useQuery } from '@sourcegraph/http-client'
import { UserAvatar } from '@sourcegraph/shared/src/components/UserAvatar'
import { OrganizationInvitationResponseType } from '@sourcegraph/shared/src/graphql-operations'
import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { EVENT_LOGGER } from '@sourcegraph/shared/src/telemetry/web/eventLogger'
import { Alert, AnchorLink, Button, LoadingSpinner, Link, H2, H3, Form } from '@sourcegraph/wildcard'

import { orgURL } from '..'
import type { AuthenticatedUser } from '../../auth'
import { ModalPage } from '../../components/ModalPage'
import { PageTitle } from '../../components/PageTitle'
import type {
    InvitationByTokenResult,
    InvitationByTokenVariables,
    RespondToOrgInvitationResult,
    RespondToOrgInvitationVariables,
} from '../../graphql-operations'
import { userURL } from '../../user'
import { OrgAvatar } from '../OrgAvatar'

import styles from './OrgInvitationPage.module.scss'

interface Props extends TelemetryV2Props {
    authenticatedUser: AuthenticatedUser
    className?: string
}

export const RESPOND_TO_ORG_INVITATION = gql`
    mutation RespondToOrgInvitation($id: ID!, $response: OrganizationInvitationResponseType!) {
        respondToOrganizationInvitation(organizationInvitation: $id, responseType: $response) {
            alwaysNil
        }
    }
`

export const INVITATION_BY_TOKEN = gql`
    query InvitationByToken($token: String!) {
        invitationByToken(token: $token) {
            ...OrganizationInvitationFields
        }
    }

    fragment OrganizationInvitationFields on OrganizationInvitation {
        createdAt
        id
        isVerifiedEmail
        organization {
            id
            displayName
            name
        }
        recipientEmail
        sender {
            avatarURL
            displayName
            username
        }
    }
`

/**
 * Displays the organization invitation for the user, based on the token in the invite URL.
 */
export const OrgInvitationPage: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    authenticatedUser,
    className,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('org/invitations')

    const { token } = useParams<{ token: string }>()
    const navigate = useNavigate()

    const {
        data: inviteData,
        loading: inviteLoading,
        error: inviteError,
    } = useQuery<InvitationByTokenResult, InvitationByTokenVariables>(INVITATION_BY_TOKEN, {
        skip: !authenticatedUser || !token,
        variables: {
            token: token!,
        },
    })

    const data = inviteData?.invitationByToken
    const orgName = data?.organization.name
    const orgId = data?.organization.id
    const sender = data?.sender
    const orgDisplayName = data?.organization.displayName || orgName
    const willVerifyEmail = data?.recipientEmail && !data?.isVerifiedEmail

    useEffect(() => {
        EVENT_LOGGER.logPageView('OrganizationInvitation', { organizationId: orgId, invitationId: data?.id })
        telemetryRecorder.recordEvent('org.invite', 'view')
    }, [orgId, data?.id, telemetryRecorder])

    const [respondToInvitation, { loading: respondLoading, error: respondError }] = useMutation<
        RespondToOrgInvitationResult,
        RespondToOrgInvitationVariables
    >(RESPOND_TO_ORG_INVITATION, {
        onError: apolloError => {
            logger.error('Error when responding to invitation', apolloError)
        },
    })

    const acceptInvitation = useCallback(async () => {
        EVENT_LOGGER.log(
            'OrganizationInvitationAcceptClicked',
            {
                organizationId: orgId,
                invitationId: data?.id,
                willVerifyEmail,
            },
            {
                organizationId: orgId,
                invitationId: data?.id,
                willVerifyEmail,
            }
        )
        try {
            await respondToInvitation({
                variables: {
                    id: data?.id || '',
                    response: OrganizationInvitationResponseType.ACCEPT,
                },
            })
            EVENT_LOGGER.log(
                'OrganizationInvitationAcceptSucceeded',
                { organizationId: orgId, invitationId: data?.id },
                { organizationId: orgId, invitationId: data?.id }
            )
            telemetryRecorder.recordEvent('org.invite', 'accept')
        } catch {
            EVENT_LOGGER.log(
                'OrganizationInvitationAcceptFailed',
                { organizationId: orgId, invitationId: data?.id },
                { organizationId: orgId, invitationId: data?.id }
            )
            telemetryRecorder.recordEvent('org.invite', 'acceptFailed')
            return
        }

        if (orgName) {
            navigate(orgURL(orgName))
        }
    }, [data?.id, navigate, orgId, orgName, respondToInvitation, willVerifyEmail, telemetryRecorder])

    const declineInvitation = useCallback(async () => {
        EVENT_LOGGER.log(
            'OrganizationInvitationDeclineClicked',
            {
                organizationId: orgId,
                invitationId: data?.id,
                willVerifyEmail,
            },
            {
                organizationId: orgId,
                invitationId: data?.id,
                willVerifyEmail,
            }
        )
        try {
            await respondToInvitation({
                variables: {
                    id: data?.id || '',
                    response: OrganizationInvitationResponseType.REJECT,
                },
            })
            EVENT_LOGGER.log(
                'OrganizationInvitationDeclineSucceeded',
                { organizationId: orgId, invitationId: data?.id },
                { organizationId: orgId, invitationId: data?.id }
            )
            telemetryRecorder.recordEvent('org.invite', 'decline')
        } catch {
            EVENT_LOGGER.log(
                'OrganizationInvitationDeclineFailed',
                { organizationId: orgId, invitationId: data?.id },
                { organizationId: orgId, invitationId: data?.id }
            )
            telemetryRecorder.recordEvent('org.invite', 'declineFailed')
        }

        navigate(userURL(authenticatedUser.username))
    }, [authenticatedUser.username, data?.id, navigate, orgId, respondToInvitation, willVerifyEmail, telemetryRecorder])

    const loading = inviteLoading || respondLoading
    const error = inviteError?.message || respondError?.message

    return (
        <>
            <PageTitle title={t('invitation-to-organization', { orgName: orgName || '' })} />
            {orgName && sender && (
                <ModalPage
                    className={classNames(styles.orgInvitationPage, className)}
                    icon={<OrgAvatar org={orgName} className="mt-3 mb-4" size="lg" />}
                >
                    <Form className="text-center pr-4 pl-4 pb-4">
                        <H2>{t('invitation-to-join-organization', { orgDisplayName })}</H2>
                        <div className="mt-4">
                            <UserAvatar className={classNames('mr-2', styles.userAvatar)} user={sender} size={24} />
                            <span>
                                <Trans
                                    i18nKey="invited-by-link"
                                    values={{
                                        senderDisplayNameSenderUsername: (
                                            <>{sender.displayName || `@${sender.username}`}</>
                                        ),
                                    }}
                                    components={{ '0': <Link to={userURL(sender.username)} /> }}
                                />

                                {sender.displayName && <span className="text-muted">(@{sender.username})</span>}
                            </span>
                        </div>
                        {data.isVerifiedEmail === false && data.recipientEmail && (
                            <div className="mt-4 mb-4">
                                <Trans
                                    i18nKey="invite-sent-to-recipient"
                                    values={{ dataRecipientEmail: <>{data.recipientEmail}</>, orgDisplayName }}
                                    components={{ '0': <strong /> }}
                                />
                            </div>
                        )}
                        <div className="mt-4">
                            <Button className="mr-sm-2" disabled={loading} onClick={acceptInvitation} variant="primary">
                                {t('join-organization', { orgDisplayName })}
                            </Button>
                            <Button
                                disabled={loading}
                                className={styles.declineButton}
                                onClick={declineInvitation}
                                variant="secondary"
                                outline={true}
                            >
                                {t('decline-invitation')}
                            </Button>
                        </div>
                        {data.isVerifiedEmail === false && data.recipientEmail && (
                            <small className="mt-4 text-muted d-inline-block">
                                <AnchorLink to="/-/sign-out">{t('sign-out-create-account')}</AnchorLink>
                                <br />
                                {t('join-organization-message', { orgDisplayName })}
                            </small>
                        )}
                    </Form>
                </ModalPage>
            )}
            {error && (
                <ModalPage className={classNames(styles.orgInvitationPage, className, 'p-4')}>
                    <H3>{t('generic-invitation-message')}</H3>
                    <Alert variant="danger" className="mt-3">
                        {t('error-message', { error })}
                    </Alert>
                </ModalPage>
            )}
            {loading && <LoadingSpinner />}
        </>
    )
}
