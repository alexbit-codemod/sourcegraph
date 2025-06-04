import React, { useCallback, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { logger } from '@sourcegraph/common'
import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { Button, ErrorAlert, Form, H3, Label, Modal } from '@sourcegraph/wildcard'

import { LoaderButton } from '../../components/LoaderButton'
import type { Scalars } from '../../graphql-operations'
import { ParentTeamSelect } from '../new/team-select/ParentTeamSelect'

import { useAssignParentTeam } from './backend'

interface EditParentTeamModalProps extends TelemetryV2Props {
    teamID: Scalars['ID']
    teamName: string
    parentTeamName: string | null

    onCancel: () => void
    afterEdit: () => void
}

export const EditParentTeamModal: React.FunctionComponent<React.PropsWithChildren<EditParentTeamModalProps>> = ({
    teamID,
    teamName,
    parentTeamName: currentParentTeamName,
    onCancel,
    afterEdit,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('team/area')

    const labelId = 'editParentTeam'

    const [parentTeam, setParentTeam] = useState<string | null>(currentParentTeamName)

    const [editTeam, { loading, error }] = useAssignParentTeam()

    const onSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
        async event => {
            event.preventDefault()
            if (!parentTeam) {
                return
            }
            if (!event.currentTarget.checkValidity()) {
                return
            }
            try {
                await editTeam({ variables: { id: teamID, parentTeamName: parentTeam } })
                telemetryRecorder.recordEvent('team.parentTeam', 'edit')
                afterEdit()
            } catch (error) {
                // Non-request error. API errors will be available under `error` above.
                logger.error(error)
                telemetryRecorder.recordEvent('team.parentTeam', 'editFail')
            }
        },
        [afterEdit, teamID, parentTeam, editTeam, telemetryRecorder]
    )

    return (
        <Modal onDismiss={onCancel} aria-labelledby={labelId}>
            <H3 id={labelId}>{t('assign-parent-team-of-team-name', { teamName })}</H3>
            {error && <ErrorAlert error={error} />}
            <Form onSubmit={onSubmit}>
                <Label htmlFor="edit-team--parent">{t('new-parent-team')}</Label>
                <ParentTeamSelect
                    id="edit-team--parent"
                    teamId={teamID}
                    initial={parentTeam ?? undefined}
                    disabled={loading}
                    onSelect={setParentTeam}
                />

                <div className="d-flex justify-content-end pt-2">
                    <Button disabled={loading} className="mr-2" onClick={onCancel} outline={true} variant="secondary">
                        {t('cancel-button')}
                    </Button>
                    <LoaderButton
                        type="submit"
                        variant="primary"
                        loading={loading}
                        disabled={loading}
                        alwaysShowLabel={true}
                        label={t('save-button')}
                    />
                </div>
            </Form>
        </Modal>
    )
}
