import React, { useCallback, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { logger } from '@sourcegraph/common'
import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { Button, H3, Modal, ErrorAlert, Form, Label } from '@sourcegraph/wildcard'

import { LoaderButton } from '../../components/LoaderButton'
import type { Scalars } from '../../graphql-operations'

import { useAddTeamMembers } from './backend'
import { UserSelect } from './user-select/UserSelect'

export interface AddTeamMemberModalProps extends TelemetryV2Props {
    teamID: Scalars['ID']
    teamName: string

    onCancel: () => void
    afterAdd: () => void
}

export const AddTeamMemberModal: React.FunctionComponent<React.PropsWithChildren<AddTeamMemberModalProps>> = ({
    teamID,
    teamName,
    onCancel,
    afterAdd,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('team/members')

    const labelId = 'addTeamMember'

    const [selectedMembers, setSelectedMembers] = useState<Scalars['ID'][]>([])

    const [addMembers, { loading, error }] = useAddTeamMembers()

    const onSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
        async event => {
            event.preventDefault()

            if (!event.currentTarget.checkValidity()) {
                return
            }

            try {
                await addMembers({
                    variables: { team: teamID, members: selectedMembers.map(member => ({ userID: member })) },
                })

                telemetryRecorder.recordEvent('team.members', 'add')
                afterAdd()
            } catch (error) {
                // Non-request error. API errors will be available under `error` above.
                logger.error(error)
                telemetryRecorder.recordEvent('team.members', 'addFail')
            }
        },
        [afterAdd, teamID, selectedMembers, addMembers, telemetryRecorder]
    )

    return (
        <Modal onDismiss={onCancel} aria-labelledby={labelId}>
            <H3 id={labelId}>{t('add-members-to-team', { teamName })}</H3>

            {error && <ErrorAlert error={error} />}

            <Form onSubmit={onSubmit}>
                <Label htmlFor="add-team-member--members" className="mt-2">
                    {t('new-members-header')}
                </Label>
                <UserSelect
                    id="add-team-member--members"
                    disabled={loading}
                    setSelectedMembers={setSelectedMembers}
                    className="mb-3"
                />

                <div className="d-flex justify-content-end pt-1">
                    <Button disabled={loading} className="mr-2" onClick={onCancel} outline={true} variant="secondary">
                        {t('cancel-button')}
                    </Button>
                    <LoaderButton
                        type="submit"
                        variant="primary"
                        loading={loading}
                        disabled={loading}
                        alwaysShowLabel={true}
                        label={t('add-members-label')}
                    />
                </div>
            </Form>
        </Modal>
    )
}
