import React, { useEffect } from 'react'

import { mdiOpenInNew } from '@mdi/js'
import { useTranslation } from 'react-i18next'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import type { TelemetryService } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { Container, PageHeader, ButtonLink, Icon, Text } from '@sourcegraph/wildcard'

import type { AuthenticatedUser } from '../../../auth'
import { PageTitle } from '../../../components/PageTitle'

interface Props extends TelemetryV2Props {
    telemetryService: TelemetryService
    authenticatedUser: Pick<AuthenticatedUser, 'emails'>
}

const SIGN_UP_FORM_URL = 'https://info.sourcegraph.com/product-research'

export const ProductResearchPage: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    telemetryService,
    telemetryRecorder,
    authenticatedUser,
}) => {
    const { t } = useTranslation('user/settings/research')

    useEffect(() => {
        telemetryService.logViewEvent('UserSettingsProductResearch')
        telemetryRecorder.recordEvent('settings.productResearch', 'view')
    }, [telemetryService, telemetryRecorder])

    const signUpForm = new URL(SIGN_UP_FORM_URL)
    const primaryEmail = authenticatedUser.emails.find(email => email.isPrimary)
    if (primaryEmail) {
        signUpForm.searchParams.set('email', primaryEmail.email)
    }

    return (
        <>
            <PageTitle title={t('product-research-title')} />
            <PageHeader headingElement="h2" path={[{ text: 'Product research and feedback' }]} className="mb-3" />
            <Container>
                <Text>{t('product-research-description')}</Text>
                <ButtonLink to={signUpForm.href} target="_blank" rel="noopener noreferrer" variant="primary">
                    {t('sign-up-now')}
                    <Icon aria-hidden={true} svgPath={mdiOpenInNew} />
                </ButtonLink>
            </Container>
        </>
    )
}
