import React from 'react'

import { mdiArchive } from '@mdi/js'
import { useTranslation } from 'react-i18next'

import { Icon } from '@sourcegraph/wildcard'

export const EmptyArchivedChangesetListElement: React.FunctionComponent<React.PropsWithChildren<{}>> = () => {
    const { t } = useTranslation('enterprise/batches/detail/changesets')

    return (
        <div className="text-muted mb-3 text-center w-100">
            <Icon className="icon" svgPath={mdiArchive} inline={false} aria-hidden={true} />
            <div className="pt-2">{t('batch-change-no-archived-changesets')}</div>
        </div>
    )
}
