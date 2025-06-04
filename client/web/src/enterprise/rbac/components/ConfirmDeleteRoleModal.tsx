import React from 'react'

import { mdiAlert } from '@mdi/js'
import { useTranslation, Trans } from 'react-i18next'

import { Button, Icon, Text, Modal, H3, Form } from '@sourcegraph/wildcard'

import { LoaderButton } from '../../../components/LoaderButton'
import type { RoleFields } from '../../../graphql-operations'

interface ConfirmDeleteRoleModalProps {
    onCancel: () => void
    onConfirm: (event: React.FormEvent) => void
    role: RoleFields
}

export const ConfirmDeleteRoleModal: React.FunctionComponent<React.PropsWithChildren<ConfirmDeleteRoleModalProps>> = ({
    onCancel,
    onConfirm,
    role,
}) => {
    const { t } = useTranslation('enterprise/rbac/components')

    const labelID = 'DeleteRole'

    return (
        <Modal onDismiss={onCancel} aria-labelledby={labelID}>
            <div className="d-flex align-items-center mb-2">
                <Icon className="icon mr-1" svgPath={mdiAlert} inline={false} aria-hidden={true} />{' '}
                <H3 id={labelID} className="mb-0">
                    {t('delete-role')}
                </H3>
            </div>
            <Text>
                <Trans i18nKey="confirm-delete-role" components={{ '0': <span className="font-weight-bold" /> }} />
            </Text>
            <Form onSubmit={onConfirm}>
                <div className="d-flex justify-content-end">
                    <Button className="mr-2" onClick={onCancel} outline={true} variant="secondary">
                        {t('cancel-action')}
                    </Button>
                    <LoaderButton type="submit" variant="danger" alwaysShowLabel={true} label={t('delete-button')} />
                </div>
            </Form>
        </Modal>
    )
}
