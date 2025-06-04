import React from 'react'

import { mdiOpenInNew } from '@mdi/js'
import { useTranslation } from 'react-i18next'

import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { Alert, Container, H2, H3, Icon, Link, Text, useReducedMotion } from '@sourcegraph/wildcard'

import { BatchChangesIcon } from '../../../batches/icons'
import { CtaBanner } from '../../../components/CtaBanner'

export interface GettingStartedProps extends TelemetryV2Props {
    isSourcegraphDotCom: boolean
    // canCreate indicates whether or not the currently-authenticated user has sufficient
    // permissions to create a batch change in whatever context this getting started
    // section is being presented. If not, canCreate will be a string reason why the user
    // cannot create.
    canCreate: true | string
    className?: string
}

const productPageUrl = 'https://sourcegraph.com/batch-changes'

export const GettingStarted: React.FunctionComponent<React.PropsWithChildren<GettingStartedProps>> = ({
    isSourcegraphDotCom,
    canCreate,
    className,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('enterprise/batches/list')

    const allowAutoplay = !useReducedMotion()

    return (
        <div className={className} data-testid="test-getting-started">
            <Container className="mb-3">
                {canCreate === true ? null : (
                    <Alert className="my-3" variant="info">
                        {canCreate}
                    </Alert>
                )}
                <div className="row align-items-center">
                    <div className="col-12 col-md-7">
                        <video
                            className="w-100 h-auto shadow"
                            width={1280}
                            height={720}
                            autoPlay={allowAutoplay}
                            muted={true}
                            loop={true}
                            playsInline={true}
                            controls={!allowAutoplay}
                        >
                            <source
                                type="video/webm"
                                src="https://storage.googleapis.com/sourcegraph-assets/batch-changes/how-it-works.webm"
                            />
                            <source
                                type="video/mp4"
                                src="https://storage.googleapis.com/sourcegraph-assets/batch-changes/how-it-works.mp4"
                            />
                        </video>
                    </div>
                    <div className="col-12 col-md-5">
                        <H2>{t('automate-large-scale-code-changes')}</H2>
                        <Text>{t('batch-changes-description')}</Text>
                        <H3>{t('use-batch-changes-to')}</H3>
                        <ul>
                            <li>{t('update-configuration-files')}</li>
                            <li>{t('update-libraries-consuming-apis')}</li>
                            <li>{t('fix-critical-security-issues')}</li>
                            <li>{t('update-boilerplate-code')}</li>
                            <li>{t('pay-down-tech-debt')}</li>
                        </ul>
                        <H3>{t('resources')}</H3>
                        <ul>
                            <li>
                                <Link to="/help/batch_changes" target="_blank" rel="noopener">
                                    {t('documentation-link')}
                                    <Icon role="img" aria-label="Open in a new tab" svgPath={mdiOpenInNew} />
                                </Link>
                            </li>
                            <li>
                                <Link to={productPageUrl} target="_blank" rel="noopener">
                                    {t('product-page-link')}
                                    <Icon role="img" aria-label="Open in a new tab" svgPath={mdiOpenInNew} />
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </Container>
            <div className="d-flex justify-content-start">
                <CtaBanner
                    bodyText={t('try-it-yourself-prompt')}
                    title={<H3>{t('start-using-batch-changes')}</H3>}
                    linkText={t('read-quickstart-docs')}
                    href="/help/batch_changes/quickstart"
                    icon={<BatchChangesIcon />}
                />
            </div>
        </div>
    )
}
