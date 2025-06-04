import React from 'react'

import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'

import { CardBody, Card, Link, H4, Text } from '@sourcegraph/wildcard'

import { SourcegraphIcon } from '../../../auth/icons'

import { BatchChangesChangelogAlert } from './BatchChangesChangelogAlert'

import styles from './BatchChangesListIntro.module.scss'

export interface BatchChangesListIntroProps {
    isLicensed: boolean | undefined
    viewerIsAdmin: boolean
}

export const BatchChangesListIntro: React.FunctionComponent<React.PropsWithChildren<BatchChangesListIntroProps>> = ({
    isLicensed,
    viewerIsAdmin,
}) => {
    if (isLicensed === undefined) {
        return null
    }

    return (
        <div className={classNames(styles.alertsRow)}>
            {isLicensed === true ? (
                <div className={classNames(styles.alertsRowContent, 'flex-1 mb-3')}>
                    <BatchChangesChangelogAlert viewerIsAdmin={viewerIsAdmin} />
                </div>
            ) : (
                <>
                    <div className={classNames(styles.alertsRowContent, 'flex-1 mb-3')}>
                        <BatchChangesUnlicensedAlert />
                    </div>
                    <BatchChangesChangelogAlert
                        viewerIsAdmin={viewerIsAdmin}
                        className={classNames(styles.alertsRowContent, 'flex-1 mb-3')}
                    />
                </>
            )}
        </div>
    )
}

const BatchChangesUnlicensedAlert: React.FunctionComponent<React.PropsWithChildren<unknown>> = () => {
    const { t } = useTranslation('enterprise/batches/list')

    return (
        <div className={classNames(styles.batchChangesListIntroAlert, 'h-100')}>
            <Card className={classNames(styles.batchChangesListIntroCard, 'h-100')}>
                <CardBody className="d-flex align-items-start">
                    {/* d-none d-sm-block ensure that we hide the icon on XS displays. */}
                    <SourcegraphIcon className="mr-3 col-2 mt-2 d-none d-sm-block" />
                    <div>
                        <H4>{t('batch-changes-trial')}</H4>
                        <Text>{t('batch-changes-description')}</Text>
                        <Text className="mb-0">
                            <Trans
                                i18nKey="contact-sales-trial-license"
                                components={{ '0': <Link to="https://sourcegraph.com/contact/sales/" /> }}
                            />
                        </Text>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}
