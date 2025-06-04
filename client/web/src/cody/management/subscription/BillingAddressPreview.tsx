import React from 'react'

import { mdiPencilOutline } from '@mdi/js'
import { useTranslation } from 'react-i18next'

import { Text, H3, Button, Icon } from '@sourcegraph/wildcard'

import type { Subscription } from '../api/teamSubscriptions'

import styles from './manage/PaymentDetails.module.scss'

export const BillingAddressPreview: React.FC<{
    subscription: Subscription
    isEditable: boolean
    onButtonClick?: () => void
    className?: string
}> = ({ subscription: { name, address }, isEditable, onButtonClick = () => undefined, className }) => {
    const { t } = useTranslation('cody/management/subscription')

    return (
        <div className={className}>
            <div className="d-flex align-items-center justify-content-between">
                <H3>{t('billing-address')}</H3>
                {isEditable && (
                    <Button variant="link" className={styles.titleButton} onClick={onButtonClick}>
                        <Icon aria-hidden={true} svgPath={mdiPencilOutline} className="mr-1" />
                        {t('edit-button')}
                    </Button>
                )}
            </div>

            <div className="mt-3">
                <Text size="small" className="mb-1 text-muted font-weight-medium">
                    {t('full-name-label')}
                </Text>
                <Text className="font-weight-medium">{name}</Text>
            </div>

            <div className="mt-3">
                <Text size="small" className="mb-1 text-muted font-weight-medium">
                    {t('country-region-label')}
                </Text>
                <Text className="font-weight-medium">{address.country || '-'}</Text>
            </div>

            <div className="mt-3">
                <Text size="small" className="mb-1 text-muted font-weight-medium">
                    {t('address-line-1-label')}
                </Text>
                <Text className="font-weight-medium">{address.line1 || '-'}</Text>
            </div>

            <div className="mt-3">
                <Text size="small" className="mb-1 text-muted font-weight-medium">
                    {t('address-line-2-label')}
                </Text>
                <Text className="font-weight-medium">{address.line2 || '-'}</Text>
            </div>

            <div className="mt-3">
                <Text size="small" className="mb-1 text-muted font-weight-medium">
                    {t('city-label')}
                </Text>
                <Text className="font-weight-medium">{address.city || '-'}</Text>
            </div>

            <div className="mt-3">
                <Text size="small" className="mb-1 text-muted font-weight-medium">
                    {t('state-label')}
                </Text>
                <Text className="font-weight-medium">{address.state || '-'}</Text>
            </div>

            <div className="mt-3">
                <Text size="small" className="mb-1 text-muted font-weight-medium">
                    {t('postal-code-label')}
                </Text>
                <Text className="font-weight-medium">{address.postalCode || '-'}</Text>
            </div>
        </div>
    )
}
