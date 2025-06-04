import type { FC } from 'react'

import { escapeRegExp } from 'lodash'
import { useTranslation, Trans } from 'react-i18next'

import { Modal, Text, H2, Link } from '@sourcegraph/wildcard'

import { DownloadFileButton } from '../../../../components/DownloadFileButton'

interface ExportInsightDataModalProps {
    insightId: string
    insightTitle: string
    showModal: boolean
    onCancel: () => void
    onConfirm: () => void
}

export const ExportInsightDataModal: FC<ExportInsightDataModalProps> = props => {
    const { t } = useTranslation('enterprise/insights/components/modals')

    const { insightId, insightTitle, showModal, onCancel, onConfirm } = props

    return (
        <Modal isOpen={showModal} position="center" aria-label="Export insight data modal" onDismiss={onCancel}>
            <H2 className="font-weight-normal">{t('export-data-insight-confirmation', { insightTitle })}</H2>

            <Text className="mt-4 mb-2">
                <Trans
                    i18nKey="csv-archive-data-explanation"
                    components={{
                        '0': (
                            <Link to="/help/code_insights/explanations/data_retention" target="_blank" rel="noopener" />
                        ),
                    }}
                />
            </Text>
            <Text>{t('data-permission-notice')}</Text>
            <div className="d-flex justify-content-end mt-5">
                <DownloadFileButton
                    fileName={escapeRegExp(insightTitle)}
                    fileUrl={`/.api/insights/export/${insightId}`}
                    variant="primary"
                    onClick={onConfirm}
                >
                    {t('export-data-as-csv')}
                </DownloadFileButton>
            </div>
        </Modal>
    )
}
