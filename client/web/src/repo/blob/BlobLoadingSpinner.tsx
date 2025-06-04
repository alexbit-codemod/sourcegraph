import { useEffect, useState } from 'react'

import { useTranslation, Trans } from 'react-i18next'
import { useLocation } from 'react-router-dom'

import { Link, LoadingSpinner } from '@sourcegraph/wildcard'

export function BlobLoadingSpinner(): JSX.Element {
    const { t } = useTranslation('repo/blob')

    const [afterOneSec, setAfterOneSec] = useState(false)
    const [afterThreeSec, setAfterThreeSec] = useState(false)
    const [afterSixSec, setAfterSixSec] = useState(false)
    const [afterNineSec, setAfterNineSec] = useState(false)

    useEffect(() => {
        const timeout = setTimeout(() => setAfterOneSec(true), 1000)
        return () => clearTimeout(timeout)
    }, [])
    useEffect(() => {
        const timeout = setTimeout(() => setAfterThreeSec(true), 3000)
        return () => clearTimeout(timeout)
    }, [])
    useEffect(() => {
        const timeout = setTimeout(() => setAfterSixSec(true), 6000)
        return () => clearTimeout(timeout)
    }, [])
    useEffect(() => {
        const timeout = setTimeout(() => setAfterNineSec(true), 9000)
        return () => clearTimeout(timeout)
    }, [])

    const location = useLocation()

    return (
        <div className="d-flex mt-3 justify-content-center">
            {afterOneSec ? (
                <div className="d-flex flex-column align-items-center">
                    <LoadingSpinner />
                    <div className="text-muted mt-2">
                        {afterNineSec ? (
                            <>
                                <Trans
                                    i18nKey="loading-file-error-retry"
                                    components={{ '0': <Link to={location.pathname} onClick={reload} /> }}
                                />
                            </>
                        ) : afterSixSec ? (
                            'Loading a whole lot of bits and bytes here...'
                        ) : afterThreeSec ? (
                            'Loading a large file...'
                        ) : (
                            ''
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    )
}

function reload(event: React.MouseEvent<HTMLAnchorElement>): void {
    window.location.reload()
    event.preventDefault()
}
