import { useEffect, useState } from 'react'

import { Button, Paper, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { call } from './api'
import { changeStage, maintenance } from './debugBar'
import { ContextProps, stage } from './Frame'

const DebugBarTimerMs = 1 * 1000

export const OperatorDebugBar: React.FC<ContextProps> = ({ context }) => {
    const { t } = useTranslation('../../../internal/appliance/frontend/maintenance/src')

    const [waiting, setWaiting] = useState(false)

    const setStage = (action: stage, data?: string) => changeStage({ action, data, onDone: () => setWaiting(true) })

    const startInstall = () => setStage('install')
    const installProgress = () => setStage('installing')
    const installWaitAdmin = () => setStage('wait-for-admin')
    const upgradeProgress = () => setStage('upgrading', '5.4.0 (beta1)')
    const noState = () => setStage('unknown')
    const launchAdminUI = () => setStage('refresh')
    const failInstall = () => {
        call('/api/operator/v1beta1/fake/install/fail', {
            method: 'POST',
        }).then(() => {
            setWaiting(true)
        })
    }
    const setMaintenance = ({ healthy }: { healthy: boolean }) =>
        maintenance({ healthy, onDone: () => setWaiting(true) })

    useEffect(() => {
        const timer = setInterval(() => {
            if (waiting) {
                setWaiting(false)
            }
        }, DebugBarTimerMs)
        return () => clearInterval(timer)
    }, [waiting])

    const showDebugBar = localStorage.getItem('debugbar') === 'true'

    return (
        context.online &&
        showDebugBar && (
            <Paper id="operator-debug" elevation={3} sx={{ m: 1, p: 2 }}>
                <Stack direction="column" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="caption">{t('operator-debug-controls')}</Typography>
                    <Stack direction="row" spacing={1}>
                        <Stack sx={{ alignItems: 'center', p: 1, border: '1px solid lightgray' }}>
                            <Typography variant="caption">{t('installation')}</Typography>
                            <Stack direction="row">
                                <Stack direction="column">
                                    <Button disabled={waiting} onClick={startInstall}>
                                        {t('start-action')}
                                    </Button>
                                    <Button disabled={waiting} onClick={installProgress}>
                                        {t('progress-indicator')}
                                    </Button>
                                </Stack>
                                <Stack direction="column">
                                    <Button disabled={waiting} onClick={installWaitAdmin}>
                                        {t('wait-for-admin')}
                                    </Button>
                                    <Button disabled={waiting} onClick={failInstall}>
                                        {t('crash-action')}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Stack>
                        <Stack sx={{ alignItems: 'center', p: 1, border: '1px solid lightgray' }}>
                            <Typography variant="caption">{t('maintenance')}</Typography>
                            <Button disabled={waiting} onClick={() => setMaintenance({ healthy: false })}>
                                {t('unhealthy-status')}
                            </Button>
                            <Button disabled={waiting} onClick={() => setMaintenance({ healthy: true })}>
                                {t('healthy-status')}
                            </Button>
                        </Stack>
                        <Stack
                            sx={{
                                alignItems: 'center',
                                p: 1,
                                border: '1px solid lightgray',
                            }}
                        >
                            <Typography variant="caption">{t('reset-action')}</Typography>
                            <Button disabled={waiting} onClick={noState}>
                                {t('reset-label')}
                            </Button>
                        </Stack>
                        <Stack
                            sx={{
                                alignItems: 'center',
                                p: 1,
                                border: '1px solid lightgray',
                            }}
                        >
                            <Typography variant="caption">{t('upgrade-action')}</Typography>
                            <Button disabled={waiting} onClick={upgradeProgress}>
                                {t('start-label')}
                            </Button>
                            <Button disabled={waiting} onClick={launchAdminUI}>
                                {t('finish-label')}
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            </Paper>
        )
    )
}
