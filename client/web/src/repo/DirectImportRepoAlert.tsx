import * as React from 'react'

import { useTranslation, Trans } from 'react-i18next'

import { Link, Alert } from '@sourcegraph/wildcard'

export const DirectImportRepoAlert: React.FunctionComponent<React.PropsWithChildren<{ className?: string }>> = ({
    className = '',
}) => {
    const { t } = useTranslation('repo')

    return (
        <>
            {['dev', 'docker-container'].includes(window.context.deployType) && (
                <Alert className={className} variant="info">
                    <Trans
                        i18nKey="very-large-repository-reuse-local-clone"
                        components={{
                            '0': (
                                <Link to="/help/admin/repo/pre_load_from_local_disk#add-repositories-already-cloned-to-disk" />
                            ),
                        }}
                    />
                </Alert>
            )}
        </>
    )
}
