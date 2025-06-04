import { useTranslation } from 'react-i18next'

import { Button, ButtonLink, H1, Text } from '@sourcegraph/wildcard'

import { CodyProRoutes } from '../codyProRoutes'
import { CodyAlert } from '../components/CodyAlert'
import { useAcceptInvite, useCancelInvite } from '../management/api/react-query/invites'

import { useInviteParams } from './useInviteParams'
import { UserInviteStatus, useInviteState } from './useInviteState'

export const AcceptInviteBanner: React.FC<{ onSuccess: () => unknown }> = ({ onSuccess }) => {
    const { inviteParams, clearInviteParams } = useInviteParams()
    if (!inviteParams) {
        return null
    }
    return (
        <AcceptInviteBannerContent
            teamId={inviteParams.teamId}
            inviteId={inviteParams.inviteId}
            onSuccess={onSuccess}
            clearInviteParams={clearInviteParams}
        />
    )
}

const AcceptInviteBannerContent: React.FC<{
    teamId: string
    inviteId: string
    onSuccess: () => unknown
    clearInviteParams: () => void
}> = ({ teamId, inviteId, onSuccess, clearInviteParams }) => {
    const { t } = useTranslation('cody/invites')

    const inviteState = useInviteState(teamId, inviteId)
    const acceptInviteMutation = useAcceptInvite()
    const cancelInviteMutation = useCancelInvite()

    if (inviteState.status === 'loading') {
        return null
    }

    if (
        inviteState.status === 'error' ||
        inviteState.initialInviteStatus !== 'sent' ||
        inviteState.initialUserStatus === UserInviteStatus.Error
    ) {
        return (
            <CodyAlert variant="error">
                <H1 as="p" className="mb-2">
                    {t('issue-with-invite')}
                </H1>
                <Text className="mb-0">{t('invitation-invalid-contact-admin')}</Text>
            </CodyAlert>
        )
    }

    switch (inviteState.initialUserStatus) {
        case UserInviteStatus.NoCurrentTeam:
        case UserInviteStatus.AnotherTeamMember: {
            // Invite has been canceled. Remove the banner.
            if (cancelInviteMutation.isSuccess || cancelInviteMutation.isError) {
                return null
            }

            switch (acceptInviteMutation.status) {
                case 'error': {
                    return (
                        <CodyAlert variant="error">
                            <H1 as="p" className="mb-2">
                                {t('issue-with-invite-duplicate')}
                            </H1>
                            <Text className="mb-0">
                                {t('accepting-invite-failed-error')}
                                {acceptInviteMutation.error.message}.
                            </Text>
                        </CodyAlert>
                    )
                }
                case 'success': {
                    return (
                        <CodyAlert variant="greenCodyPro">
                            <H1 as="p" className="mb-2">
                                {t('pro-team-change-complete')}
                            </H1>
                            <Text>
                                {inviteState.initialUserStatus === UserInviteStatus.NoCurrentTeam
                                    ? 'You successfully joined the new Cody Pro team.'
                                    : 'Your pro team has been successfully changed.'}
                            </Text>
                        </CodyAlert>
                    )
                }
                case 'idle':
                case 'pending':
                default: {
                    return (
                        <CodyAlert variant="purple">
                            <H1 as="p" className="mb-2">
                                {t('join-new-cody-pro-team')}
                            </H1>
                            <Text>
                                {t('invited-to-new-cody-pro-team')}
                                {inviteState.sentBy}.
                            </Text>
                            <Text>
                                {inviteState.initialUserStatus === UserInviteStatus.NoCurrentTeam
                                    ? 'You will get unlimited autocompletions, chat messages and commands.'
                                    : 'This will terminate your current Cody Pro plan, and place you on the new Cody Pro team. You will not lose access to your Cody Pro benefits.'}
                            </Text>
                            <div>
                                <Button
                                    variant="primary"
                                    disabled={acceptInviteMutation.isPending || cancelInviteMutation.isPending}
                                    className="mr-3"
                                    onClick={() =>
                                        acceptInviteMutation.mutate(
                                            { teamId, inviteId },
                                            { onSuccess, onSettled: clearInviteParams }
                                        )
                                    }
                                >
                                    {t('accept-invite')}
                                </Button>
                                <Button
                                    variant="link"
                                    disabled={acceptInviteMutation.isPending || cancelInviteMutation.isPending}
                                    onClick={() =>
                                        cancelInviteMutation.mutate(
                                            { teamId, inviteId },
                                            { onSettled: clearInviteParams }
                                        )
                                    }
                                >
                                    {t('decline-invite')}
                                </Button>
                            </div>
                        </CodyAlert>
                    )
                }
            }
        }
        case UserInviteStatus.InvitedTeamMember: {
            if (cancelInviteMutation.isIdle) {
                void cancelInviteMutation.mutate({ teamId, inviteId }, { onSettled: clearInviteParams })
            }
            return (
                <CodyAlert variant="error">
                    <H1 as="p" className="mb-2">
                        {t('issue-with-invite-duplicate-2')}
                    </H1>
                    <Text className="mb-0">
                        {t('invited-to-cody-pro-team')}
                        {inviteState.sentBy}.<br />
                        {t('cannot-accept-invite-already-on-team')}
                    </Text>
                </CodyAlert>
            )
        }
        case UserInviteStatus.AnotherTeamSoleAdmin: {
            return (
                <CodyAlert variant="error">
                    <H1 as="p" className="mb-2">
                        {t('issue-with-invite-duplicate-3')}
                    </H1>
                    <Text className="mb-0">
                        {t('invited-to-new-cody-pro-team-duplicate')}
                        {inviteState.sentBy}.
                    </Text>
                    <Text>{t('accept-invite-transfer-role')}</Text>
                    <div>
                        <ButtonLink variant="primary" to={CodyProRoutes.ManageTeam}>
                            {t('manage-team')}
                        </ButtonLink>
                    </div>
                </CodyAlert>
            )
        }
        default: {
            return null
        }
    }
}
