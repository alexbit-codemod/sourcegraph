import type { FC } from 'react'

import { mdiCodeBraces, mdiLock, mdiChevronRight } from '@mdi/js'
import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'

import { H3, Text, Link, Icon } from '@sourcegraph/wildcard'

import { MarketingBlock } from '../../../components/MarketingBlock'
import { useLegacyContext_onlyInStormRoutes } from '../../../LegacyRouteContext'

import styles from './AddCodeHostWidget.module.scss'

interface AddCodeHostWidgetProps {
    className?: string
}

export const AddCodeHostWidget: FC<AddCodeHostWidgetProps> = props => {
    const { t } = useTranslation('storm/pages/SearchPage')

    const { className } = props
    const { telemetryService, platformContext } = useLegacyContext_onlyInStormRoutes()
    const { telemetryRecorder } = platformContext

    return (
        <MarketingBlock
            wrapperClassName={classNames('mt-3 mx-auto', className, styles.container)}
            contentClassName={classNames(styles.innerContainer, 'p-4 d-flex flex-column align-items-baseline')}
        >
            <H3 className="mr-2 mb-1">{t('lets-start-adding-code')}</H3>
            <Text
                as={Link}
                to="/site-admin/external-services/new"
                className="d-inline-flex align-items-center"
                weight="medium"
                onClick={() => {
                    telemetryService.log('OnboardingWidget:ConnectCodeHost:Clicked')
                    telemetryRecorder.recordEvent('onboardingWidget.connectCodeHost', 'click')
                }}
            >
                {t('connect-code-host')}
                <Icon svgPath={mdiChevronRight} className="ml-1" size="md" aria-label="Arrow right icon" />
            </Text>
            <div className={classNames(styles.divider, 'w-100 my-3')} />
            <div className="d-flex mb-2">
                <Icon svgPath={mdiCodeBraces} size="md" className="mr-2" aria-label="Code brace icon" />
                <div>
                    <Text weight="bold" className="mb-1">
                        {t('sourcegraph-connect-explanation')}
                    </Text>
                    <Text className="text-muted">
                        <Trans
                            i18nKey="sourcegraph-syncs-repositories"
                            components={{
                                '0': (
                                    <Link
                                        to="/help/admin/external_service"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.textUnderline}
                                        onClick={() => {
                                            telemetryService.log('OnboardingWidget:ViewDocs:Clicked')
                                            telemetryRecorder.recordEvent('onboardingWidget.viewDocs', 'click')
                                        }}
                                    />
                                ),
                            }}
                        />
                    </Text>
                </div>
            </div>
            <div className="d-flex">
                <Icon svgPath={mdiLock} size="md" className="mr-2" aria-label="Lock icon" />
                <div>
                    <Text weight="bold" className="mb-1">
                        {t('want-to-know-more-security')}
                    </Text>
                    <Text className="text-muted m-0">
                        <Trans
                            i18nKey="sourcegraph-soc2-audit-info"
                            components={{
                                '0': (
                                    <Link
                                        to="https://security.sourcegraph.com/?itemUid=7bfa66da-33ab-49de-8391-e329738a1ae9&source=title"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.textUnderline}
                                        onClick={() => {
                                            telemetryService.log('OnboardingWidget:ViewSOC2:Clicked')
                                            telemetryRecorder.recordEvent('onboardingWidget.viewSOC2', 'click')
                                        }}
                                    />
                                ),
                                '1': (
                                    <Link
                                        to="https://security.sourcegraph.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.textUnderline}
                                        onClick={() => {
                                            telemetryService.log('OnboardingWidget:ViewSecurityPortal:Clicked')
                                            telemetryRecorder.recordEvent(
                                                'onboardingWidget.viewSecurityPortal',
                                                'click'
                                            )
                                        }}
                                    />
                                ),
                            }}
                        />
                    </Text>
                </div>
            </div>
        </MarketingBlock>
    )
}
