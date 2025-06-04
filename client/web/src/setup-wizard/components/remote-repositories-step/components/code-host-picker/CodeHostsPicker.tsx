import type { FC } from 'react'

import { useTranslation } from 'react-i18next'

import { ExternalServiceKind } from '@sourcegraph/shared/src/graphql-operations'
import { Button, Link } from '@sourcegraph/wildcard'

import { CodeHostIcon, getCodeHostName, getCodeHostURLParam } from '../../helpers'

import styles from './CodeHostsPicker.module.scss'

const SUPPORTED_CODE_HOSTS = [
    ExternalServiceKind.GITHUB,
    ExternalServiceKind.GITLAB,
    ExternalServiceKind.GERRIT,
    ExternalServiceKind.BITBUCKETCLOUD,
    ExternalServiceKind.BITBUCKETSERVER,
    ExternalServiceKind.AWSCODECOMMIT,
    ExternalServiceKind.GITOLITE,
    ExternalServiceKind.AZUREDEVOPS,
]

export const CodeHostsPicker: FC = () => {
    const { t } = useTranslation('setup-wizard/components/remote-repositories-step/components/code-host-picker')

    return (
        <section>
            <header className={styles.header}>
                <span>{t('add-another-remote-code-host')}</span>
                <small className="text-muted">{t('choose-provider-from-list')}</small>
            </header>

            <ul className={styles.list}>
                {SUPPORTED_CODE_HOSTS.map(codeHostType => (
                    <li key={codeHostType}>
                        <Button
                            as={Link}
                            to={`${getCodeHostURLParam(codeHostType)}/create`}
                            variant="secondary"
                            outline={true}
                            className={styles.item}
                        >
                            <CodeHostIcon codeHostType={codeHostType} aria-hidden={true} />
                            <span>{getCodeHostName(codeHostType)}</span>
                        </Button>
                    </li>
                ))}
            </ul>
        </section>
    )
}
