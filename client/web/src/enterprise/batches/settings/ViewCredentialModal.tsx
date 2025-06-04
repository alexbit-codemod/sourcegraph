import React from 'react'

import { useTranslation } from 'react-i18next'

import { Button, Modal, H4, Input } from '@sourcegraph/wildcard'

import type { BatchChangesCodeHostFields, BatchChangesCredentialFields } from '../../../graphql-operations'

import { CodeHostSshPublicKey } from './CodeHostSshPublicKey'
import { ModalHeader } from './ModalHeader'

interface ViewCredentialModalProps {
    codeHost: BatchChangesCodeHostFields
    credential: BatchChangesCredentialFields

    onClose: () => void
}

export const ViewCredentialModal: React.FunctionComponent<React.PropsWithChildren<ViewCredentialModalProps>> = ({
    credential,
    codeHost,
    onClose,
}) => {
    const { t } = useTranslation('enterprise/batches/settings')

    const labelId = 'viewCredential'
    return (
        <Modal onDismiss={onClose} aria-labelledby={labelId}>
            <ModalHeader
                id={labelId}
                externalServiceKind={codeHost.externalServiceKind}
                externalServiceURL={codeHost.externalServiceURL}
            />

            <H4>{t('personal-access-token')}</H4>
            <Input className="form-group" value="PATs cannot be viewed after entering." disabled={true} />

            <hr className="mb-3" />

            <CodeHostSshPublicKey
                externalServiceKind={codeHost.externalServiceKind}
                sshPublicKey={credential.sshPublicKey!}
            />

            <div className="d-flex justify-content-end">
                <Button onClick={onClose} outline={true} variant="secondary">
                    {t('close-button-text')}
                </Button>
            </div>
        </Modal>
    )
}
