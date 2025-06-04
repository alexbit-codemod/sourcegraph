import React from 'react'

import { mdiClose } from '@mdi/js'
import { VisuallyHidden } from '@reach/visually-hidden'
import { useTranslation } from 'react-i18next'

import { Button, Link, Modal, H3, H4, Text, Icon } from '@sourcegraph/wildcard'

import styles from './RunServerSideModal.module.scss'

export interface RunServerSideModalProps {
    setIsRunServerSideModalOpen: (condition: boolean) => void
}

export const RunServerSideModal: React.FunctionComponent<RunServerSideModalProps> = ({
    setIsRunServerSideModalOpen,
}) => {
    const { t } = useTranslation('enterprise/batches/batch-spec/edit')

    return (
        <Modal
            onDismiss={() => {
                setIsRunServerSideModalOpen(false)
            }}
            aria-labelledby={MODAL_LABEL_ID}
            className={styles.modal}
        >
            <H3 id={MODAL_LABEL_ID}>{t('running-batch-changes-server-side-not-enabled')}</H3>
            <Button
                className={styles.close}
                onClick={() => {
                    setIsRunServerSideModalOpen(false)
                }}
            >
                <VisuallyHidden>{t('close-button')}</VisuallyHidden>
                <Icon className={styles.icon} svgPath={mdiClose} inline={false} aria-hidden={true} />
            </Button>

            <div className={styles.content}>
                <div className={styles.left}>
                    <Text>{t('install-executors-batch-changes-server-side')}</Text>

                    <video
                        className="w-100 h-auto shadow"
                        width={1280}
                        height={720}
                        autoPlay={true}
                        muted={true}
                        loop={true}
                        playsInline={true}
                        controls={false}
                    >
                        <source
                            type="video/webm"
                            src="https://storage.googleapis.com/sourcegraph-assets/ssbc_demo.webm"
                        />
                        <source
                            type="video/mp4"
                            src="https://storage.googleapis.com/sourcegraph-assets/ssbc_demo.mp4"
                        />
                    </video>
                </div>
                <div className={styles.right}>
                    <div className={styles.rightTop}>
                        <H4>{t('resources-label')}</H4>
                        <ul className={styles.linksList}>
                            <Link to="/help/batch_changes/explanations/server_side">
                                <li>{t('running-batch-changes-server-side-label')}</li>
                            </Link>
                            <Link to="/help/admin/executors">
                                <li>{t('deploying-executors-label')}</li>
                            </Link>
                        </ul>
                    </div>

                    {/* TODO: Restore this once we have a process and link for requesting this demo */}
                    {/* <div className={styles.rightBottom}>
                    <div className={styles.blank}>
                        <H4>Request a demo</H4>
                        <Text>Learn more about this free feature of batch changes.</Text>

                        <Button variant="primary">Request Demo</Button>
                    </div>
                </div> */}
                </div>
            </div>
        </Modal>
    )
}

const MODAL_LABEL_ID = 'run-server-side-modal'
