import styledReact from '@emotion/styled'
import { styled } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { ContextProps } from './Frame'

const Circle = styledReact.div`
  width: 18px;
  height: 18px;
  border-radius: 12px;
`
const OnlineIcon = styled(Circle)`
    background-color: rgb(82, 240, 82);
`
const OfflineIcon = styled(Circle)`
    background-color: rgb(240, 82, 82);
`

export const OperatorStatus: React.FC<ContextProps> = ({ context }) => {
    const { t } = useTranslation('../../../internal/appliance/frontend/maintenance/src')

    const Status = () => {
        const { t } = useTranslation('../../../internal/appliance/frontend/maintenance/src')

        return context.online === undefined ? (
            <div className="status connecting">{t('connecting-status')}</div>
        ) : context.online === true || context.needsLogin === true ? (
            <div className="status online">
                <OnlineIcon />
            </div>
        ) : (
            <div className="status offline">
                <OfflineIcon />
            </div>
        )
    }

    switch (context.stage) {
        case 'refresh':
            document.location = '/?cacheBust=' + Date.now()
            break
    }

    return (
        <div id="operator-status">
            {t('status-message')}
            <Status />
            {context.online === false && <Navigate to="/" />}
            {context.stage === 'unknown' && <Navigate to="/" />}
            {context.stage === 'install' && <Navigate to="/install" />}
            {context.stage === 'installing' && <Navigate to="/install/progress" />}
            {context.stage === 'wait-for-admin' && <Navigate to="/install/wait-for-admin" />}
            {context.stage === 'upgrading' && <Navigate to="/upgrade/progress" />}
            {context.stage === 'maintenance' && <Navigate to="/maintenance" />}
        </div>
    )
}
