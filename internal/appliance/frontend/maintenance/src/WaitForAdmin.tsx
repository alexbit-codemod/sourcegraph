import { useEffect, useState } from 'react'

import { Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { changeStage } from './debugBar'

const TestAdminUIGoodMs = 1 * 1000
const WaitBeforeLaunchMs = 3 * 1000

export const WaitForAdmin: React.FC = () => {
    const { t } = useTranslation('../../../internal/appliance/frontend/maintenance/src')

    const [waitingForBalancer, setWaitingForBalancer] = useState<boolean>(false)
    const [launching, setLaunching] = useState<boolean>(false)

    useEffect(() => {
        if (launching) {
            const timer = setInterval(() => {
                changeStage({ action: 'refresh' })
            }, WaitBeforeLaunchMs)
            return () => clearInterval(timer)
        }
    }, [launching])

    useEffect(() => {
        const timer = setInterval(() => {
            fetch('/sign-in')
                .then(result => {
                    console.log('waiting for admin ui', result)
                    if (result.ok) {
                        setLaunching(true)
                        setWaitingForBalancer(false)
                    }
                })
                .catch(console.error)
        }, TestAdminUIGoodMs)
        return () => clearInterval(timer)
    }, [waitingForBalancer])

    return (
        <div className="wait-for-admin">
            <Typography variant="h5">{t('waiting-for-admin-to-return')}</Typography>
            <div>
                <Typography sx={{ m: 2 }}>{t('appliance-ready-security-setup')}</Typography>
                <Typography sx={{ m: 2 }}>{t('press-button-launch-admin-ui')}</Typography>
            </div>
            <Button
                variant="contained"
                onClick={() => setWaitingForBalancer(true)}
                disabled={launching || waitingForBalancer}
            >
                {t('launch-admin-ui-button')}
            </Button>
            {launching && (
                <Stack direction="row" spacing={2}>
                    <CircularProgress size={32} />
                    <Typography variant="h5">{t('launching-admin-ui-please-wait')}</Typography>
                </Stack>
            )}
            {waitingForBalancer && (
                <Stack direction="row" spacing={2}>
                    <CircularProgress size={32} />
                    <Typography variant="h5">{t('waiting-for-admin-ui-to-be-ready')}</Typography>
                </Stack>
            )}
        </div>
    )
}
