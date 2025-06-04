import React from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { Button, Modal, H3, Text } from '@sourcegraph/wildcard'

export interface ReplaceSpecModalProps {
    libraryItemName: string
    onCancel: () => void
    onConfirm: () => void
}

export const ReplaceSpecModal: React.FunctionComponent<React.PropsWithChildren<ReplaceSpecModalProps>> = ({
    libraryItemName,
    onCancel,
    onConfirm,
}) => {
    const { t } = useTranslation('enterprise/batches/batch-spec/edit/library')

    return (
        <Modal onDismiss={onCancel} aria-labelledby={MODAL_LABEL_ID}>
            <H3 id={MODAL_LABEL_ID}>{t('replace-batch-spec-question')}</H3>
            <Text className="mb-4">
                <Trans
                    i18nKey="replace-batch-spec-confirmation-message"
                    values={{ libraryItemName: <>{libraryItemName}</> }}
                    components={{ '0': <strong /> }}
                />
            </Text>
            <div className="d-flex justify-content-end">
                <Button className="mr-2" onClick={onCancel} outline={true} variant="secondary">
                    {t('cancel-button-label')}
                </Button>
                <Button onClick={onConfirm} variant="primary">
                    {t('confirm-button-label')}
                </Button>
            </div>
        </Modal>
    )
}

const MODAL_LABEL_ID = 'replace-batch-spec-modal-title'
