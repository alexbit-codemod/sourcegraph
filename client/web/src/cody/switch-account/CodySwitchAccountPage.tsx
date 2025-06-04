import type React from 'react'
import { useEffect } from 'react'

import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { UserAvatar } from '@sourcegraph/shared/src/components/UserAvatar'
import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { Button, ButtonLink, Card, AnchorLink, Text } from '@sourcegraph/wildcard'

import type { AuthenticatedUser } from '../../auth'
import { Page } from '../../components/Page'
import { PageTitle } from '../../components/PageTitle'
import { CodyProRoutes } from '../codyProRoutes'

import styles from './CodySwitchAccountPage.module.scss'

interface CodySwitchAccountPageProps extends TelemetryV2Props {
    authenticatedUser: AuthenticatedUser | null
}

export const CodySwitchAccountPage: React.FunctionComponent<CodySwitchAccountPageProps> = ({
    authenticatedUser,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('cody/switch-account')

    useEffect(() => {
        telemetryRecorder.recordEvent('cody.switch-account', 'view')
    }, [telemetryRecorder])

    const navigate = useNavigate()
    const { username = '' } = useParams()

    const accountSwitchNotRequired = !username || !authenticatedUser || authenticatedUser.username === username
    useEffect(() => {
        if (accountSwitchNotRequired) {
            navigate(CodyProRoutes.Manage)
        }
    }, [accountSwitchNotRequired, navigate])

    if (accountSwitchNotRequired || !authenticatedUser) {
        return null
    }

    return (
        <Page className="d-flex flex-column">
            <PageTitle title={t('switch-account')} />
            <div className="flex-1" />
            <Card className={classNames('d-flex flex-column flex-1 mx-auto p-4', styles.switchAccountCard)}>
                <Text>
                    <Trans
                        i18nKey="different-account-signed-in"
                        values={{ username }}
                        components={{ '0': <strong /> }}
                    />
                </Text>
                <Button to="/-/sign-out" as={AnchorLink} variant="primary" className="mt-3">
                    {t('sign-out-to-switch-accounts')}
                </Button>
                <div className="my-4 d-flex align-items-center justify-content-center">
                    <hr className="flex-1" />
                    <Text className="text-muted mb-0 px-2" size="small">
                        {t('or-separator')}
                    </Text>
                    <hr className="flex-1" />
                </div>

                <div className="d-flex align-items-center border rounded p-2 mb-2">
                    <div>
                        <UserAvatar size={32} user={authenticatedUser} />
                    </div>
                    <div className="d-flex flex-column ml-2">
                        <Text className="mb-0" weight="medium">
                            {authenticatedUser.displayName} (@{authenticatedUser.username})
                        </Text>
                        <Text className="mb-0 text-muted">{authenticatedUser.emails[0].email}</Text>
                    </div>
                </div>
                <ButtonLink to={CodyProRoutes.Manage} variant="secondary">
                    {t('continue-button')}
                </ButtonLink>
            </Card>
            <div className="flex-1" />
        </Page>
    )
}
