import React from 'react'

import { mdiClose } from '@mdi/js'
import { VisuallyHidden } from '@reach/visually-hidden'
import { useTranslation, Trans } from 'react-i18next'

import { CodeSnippet } from '@sourcegraph/branded/src/components/CodeSnippet'
import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { Button, Link, Modal, H3, H4, Text, Icon } from '@sourcegraph/wildcard'

import { BatchSpecDownloadLink, getFileName } from '../../BatchSpec'

import styles from './DownloadSpecModal.module.scss'

export interface DownloadSpecModalProps extends TelemetryV2Props {
    name: string
    originalInput: string
    setIsDownloadSpecModalOpen: (condition: boolean) => void
    setDownloadSpecModalDismissed: (condition: boolean) => void
}

export const DownloadSpecModal: React.FunctionComponent<React.PropsWithChildren<DownloadSpecModalProps>> = ({
    name,
    originalInput,
    setIsDownloadSpecModalOpen,
    setDownloadSpecModalDismissed,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('enterprise/batches/batch-spec/edit')

    return (
        <Modal
            onDismiss={() => {
                setIsDownloadSpecModalOpen(false)
            }}
            aria-labelledby={MODAL_LABEL_ID}
            className={styles.modal}
        >
            <div>
                <H3 id={MODAL_LABEL_ID}>{t('download-spec-src-cli')}</H3>
                <Button
                    className={styles.close}
                    onClick={() => {
                        setIsDownloadSpecModalOpen(false)
                    }}
                >
                    <VisuallyHidden>{t('close-button')}</VisuallyHidden>
                    <Icon className={styles.icon} svgPath={mdiClose} inline={false} aria-hidden={true} />
                </Button>
            </div>

            <div className={styles.container}>
                <div className={styles.left}>
                    <Text>
                        <Trans i18nKey="sourcegraph-cli-instructions" components={{ '0': <Link to="/help/cli" /> }} />
                    </Text>

                    <CodeSnippet
                        code={`src batch preview -f ${getFileName(name)}`}
                        language="bash"
                        className={styles.codeSnippet}
                    />

                    <Text className="p-0 m-0">{t('batch-change-preview-instructions')}</Text>
                </div>
                <div className={styles.right}>
                    <div>
                        <H4>{t('about-src-cli')}</H4>
                        <Text>
                            <Trans
                                i18nKey="src-cli-description"
                                components={{ '0': <span className="text-monospace" /> }}
                            />
                        </Text>
                        <Link to="/help/cli">{t('download-src-cli')}</Link>
                    </div>
                </div>
            </div>
            <div className="d-flex justify-content-between">
                <Button className="p-0" onClick={() => setDownloadSpecModalDismissed(true)} variant="link">
                    {t('dont-show-again')}
                </Button>
                <div className="ml-auto">
                    <Button
                        className="mr-2"
                        outline={true}
                        variant="secondary"
                        onClick={() => {
                            setIsDownloadSpecModalOpen(false)
                        }}
                    >
                        {t('cancel-button')}
                    </Button>
                    <BatchSpecDownloadLink
                        name={name}
                        originalInput={originalInput}
                        asButton={false}
                        telemetryRecorder={telemetryRecorder}
                    >
                        <Button
                            variant="primary"
                            onClick={() => {
                                setIsDownloadSpecModalOpen(false)
                            }}
                        >
                            {t('download-spec')}
                        </Button>
                    </BatchSpecDownloadLink>
                </div>
            </div>
        </Modal>
    )
}

const MODAL_LABEL_ID = 'download-spec-modal'
