import React from 'react'

import { mdiPencilOutline, mdiCreditCardOutline, mdiPlus } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { H3, Button, Icon, Text } from '@sourcegraph/wildcard'

import type { Subscription } from '../api/teamSubscriptions'

import styles from './manage/PaymentDetails.module.scss'

export const PaymentMethodPreview: React.FC<
    Pick<Subscription, 'paymentMethod'> & { isEditable: boolean; onButtonClick?: () => void; className?: string }
> = ({ paymentMethod, isEditable, onButtonClick = () => undefined, className }) => {
    const { t } = useTranslation('cody/management/subscription')

    return paymentMethod ? (
        <div className={className}>
            <div className="d-flex align-items-center justify-content-between">
                <H3>{t('active-credit-card')}</H3>
                {isEditable && (
                    <Button variant="link" className={styles.titleButton} onClick={onButtonClick}>
                        <Icon aria-hidden={true} svgPath={mdiPencilOutline} className="mr-1" />
                        {t('edit-button')}
                    </Button>
                )}
            </div>
            <div className="mt-3 d-flex justify-content-between">
                <Text as="span" className={classNames('text-muted', styles.paymentMethodNumber)}>
                    <Icon aria-hidden={true} svgPath={mdiCreditCardOutline} /> ···· ···· ···· {paymentMethod.last4}
                </Text>
                <Text as="span" className="text-muted">
                    {t('expires-label')}
                    {paymentMethod.expMonth}/{paymentMethod.expYear}
                </Text>
            </div>
        </div>
    ) : (
        <div className={classNames('d-flex align-items-center justify-content-between', className)}>
            <H3>{t('no-payment-method')}</H3>
            {isEditable && (
                <Button variant="link" className={styles.titleButton} onClick={onButtonClick}>
                    <Icon aria-hidden={true} svgPath={mdiPlus} className="mr-1" />
                    {t('add-button')}
                </Button>
            )}
        </div>
    )
}
