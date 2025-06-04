import { Fragment, useEffect, useState } from 'react'

import Unhealthy from '@mui/icons-material/CarCrashOutlined'
import Healthy from '@mui/icons-material/ThumbUp'
import { Alert, Button, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { call } from './api'
import { maintenance } from './debugBar'

const MaintenanceStatusTimerMs = 1 * 1000
const WaitToLaunchFixMs = 5 * 1000

type Service = {
    name: string
    healthy: boolean
    message: string
}

type Status = {
    services: Service[]
}

const ShowServices: React.FC<{ services: Service[] }> = ({ services }) => {
    const { t } = useTranslation('../../../internal/appliance/frontend/maintenance/src')

    return services.length > 0 ? (
        <Grid container spacing={2} className="service-grid">
            <Grid item xs={3} className="service-header">
                <Typography variant="caption">{t('service')}</Typography>
            </Grid>
            <Grid item xs={3} className="service-header">
                <Typography variant="caption">{t('health')}</Typography>
            </Grid>
            <Grid item xs={6} className="service-header">
                <Typography variant="caption">{t('message')}</Typography>
            </Grid>
            {services.map((s: Service) => {
                const className = classNames('service-item', s.healthy ? 'healthy' : 'unhealthy')
                return (
                    <Fragment key={s.name}>
                        <Grid item xs={3} className={className}>
                            {s.name}
                        </Grid>
                        <Grid item xs={3} className={className}>
                            {s.healthy && <Healthy />}
                            {!s.healthy && <Unhealthy />}
                        </Grid>
                        <Grid item xs={6} className={className}>
                            {s.message}
                        </Grid>
                    </Fragment>
                )
            })}
        </Grid>
    ) : null
}

export const Maintenance: React.FC = () => {
    const { t } = useTranslation('../../../internal/appliance/frontend/maintenance/src')

    const [status, setStatus] = useState<Status | undefined>()
    const [fixing, setFixing] = useState<boolean>(false)

    useEffect(() => {
        const timer = setInterval(() => {
            call('/api/operator/v1beta1/maintenance/status')
                .then(response => response.json())
                .then(setStatus)
        }, MaintenanceStatusTimerMs)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (fixing) {
            const timer = setInterval(() => {
                maintenance({ healthy: true }).then(() => setFixing(false))
            }, WaitToLaunchFixMs)
            return () => clearInterval(timer)
        }
    }, [fixing])

    const ready = status?.services.length !== undefined
    const unhealthy = status?.services?.find((s: Service) => !s.healthy)

    return (
        <div className="maintenance">
            <Typography variant="h5">{t('maintenance-page')}</Typography>
            {ready ? (
                unhealthy ? (
                    <Alert severity="warning">{t('error-message-logs')}</Alert>
                ) : (
                    <Alert severity="success">{t('everything-is-pretty')}</Alert>
                )
            ) : (
                <CircularProgress />
            )}

            {ready ? (
                <>
                    <Typography variant="h5">{t('service-status')}</Typography>
                    <ShowServices services={status?.services ?? []} />
                </>
            ) : null}

            {unhealthy && (
                <>
                    <Typography variant="h5">{t('actions')}</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" onClick={() => setFixing(true)}>
                            {t('restart-cluster')}
                        </Button>
                        <Button variant="contained" onClick={() => alert('failed :-(')}>
                            {t('page-on-call')}
                        </Button>
                        <Button variant="contained" onClick={() => alert('failed :-(')}>
                            {t('call-support')}
                        </Button>
                    </Stack>
                </>
            )}

            {fixing && (
                <Stack direction="row" spacing={2}>
                    <CircularProgress size={32} />
                    <Typography variant="h5">{t('fixing-please-wait')}</Typography>
                </Stack>
            )}
        </div>
    )
}
