import { type FC, useState } from 'react'

import { useTranslation } from 'react-i18next'

import {
    debugEventLoggingEnabled,
    setDebugEventLoggingEnabled,
} from '@sourcegraph/shared/src/telemetry/web/eventLogger'
import { Checkbox } from '@sourcegraph/wildcard'

export const EventLoggingDebugToggle: FC<{}> = () => {
    const { t } = useTranslation('devsettings/settings')

    const [enabled, setEnabled] = useState(debugEventLoggingEnabled())
    return (
        <Checkbox
            id="event-logging-debug-toggle"
            checked={enabled}
            onChange={event => {
                setDebugEventLoggingEnabled(event.target.checked)
                setEnabled(debugEventLoggingEnabled())
            }}
            label={t('enable-event-telemetry-debugging')}
            message="When enabled events logged via eventLogger or telemetryService are logged (as debug messages) to the console."
        />
    )
}
