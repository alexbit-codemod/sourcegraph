import { CircularProgress, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import './App.css'

import { useOutletContext } from 'react-router-dom'

import { OutletContext } from './Frame'

export const Home: React.FC = () => {
    const { t } = useTranslation('../../../internal/appliance/frontend/maintenance/src')

    const context = useOutletContext<OutletContext>()

    return (
        <div className="home">
            <CircularProgress size={18} />
            {context.online || context.needsLogin ? (
                <>
                    <Typography>{t('appliance-connected-please-wait')}</Typography>
                </>
            ) : (
                <>
                    <Typography>{t('connecting-sourcegraph-appliance')}</Typography>
                </>
            )}
        </div>
    )
}
