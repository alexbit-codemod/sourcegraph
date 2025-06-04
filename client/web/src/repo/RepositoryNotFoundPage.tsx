import * as React from 'react'

import MapSearchIcon from 'mdi-react/MapSearchIcon'
import { useTranslation, Trans } from 'react-i18next'

import { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import { EVENT_LOGGER } from '@sourcegraph/shared/src/telemetry/web/eventLogger'
import { Code, Link, Text } from '@sourcegraph/wildcard'

import { HeroPage } from '../components/HeroPage'

import styles from './RepositoryNotFoundPage.module.scss'

interface Props extends TelemetryV2Props {
    /** The name of the repository. */
    repo: string

    /** Whether the viewer is a site admin. */
    viewerCanAdminister: boolean
}

/**
 * A page informing the user that an error occurred while trying to display the repository. It
 * attempts to present the user with actions to solve the problem.
 */
export const RepositoryNotFoundPage: React.FunctionComponent<Props> = ({
    repo,
    viewerCanAdminister,
    telemetryRecorder,
}) => {
    const { t } = useTranslation('repo')

    React.useEffect(() => {
        EVENT_LOGGER.logViewEvent('RepositoryError')
        telemetryRecorder.recordEvent('repo.error.notFound', 'view')
    }, [telemetryRecorder])

    return (
        <HeroPage
            icon={MapSearchIcon}
            title={t('repository-not-found')}
            subtitle={
                <div className={styles.repositoryNotFoundPage}>
                    {viewerCanAdminister && (
                        <Text>
                            {t('site-admin-add-external-service')}
                            <Code>{repo}</Code>
                            <Trans
                                i18nKey="connect-external-service-reference"
                                components={{ '0': <Link to="/site-admin/external-services" /> }}
                            />
                        </Text>
                    )}
                    {!viewerCanAdminister && <Text>{t('contact-sourcegraph-admin')}</Text>}
                </div>
            }
        />
    )
}
