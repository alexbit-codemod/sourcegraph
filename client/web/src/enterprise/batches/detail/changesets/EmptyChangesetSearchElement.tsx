import React from 'react'

import { mdiMagnify } from '@mdi/js'
import { useTranslation } from 'react-i18next'

import { Icon } from '@sourcegraph/wildcard'

export const EmptyChangesetSearchElement: React.FunctionComponent<React.PropsWithChildren<{}>> = () => {
    const { t } = useTranslation('enterprise/batches/detail/changesets')

    return (
        <div className="text-muted row mb-3 w-100">
            <div className="col-12 text-center">
                <Icon className="icon" svgPath={mdiMagnify} inline={false} aria-hidden={true} />
                <div className="pt-2">{t('no-changesets-matched-search')}</div>
            </div>
        </div>
    )
}
