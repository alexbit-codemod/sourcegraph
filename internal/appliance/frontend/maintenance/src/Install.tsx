import { useState } from 'react'

import { Button, Checkbox, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import search from '../assets/sourcegraph.png'

import { changeStage } from './debugBar'

interface InstallerProps {
    allowDisable: boolean
}

export const Install: React.FC = () => {
    const { t } = useTranslation('../../../internal/appliance/frontend/maintenance/src')

    const [version, setVersion] = useState<string>('5.3.1')
    const [installSearch, setInstallSearch] = useState<boolean>(true)

    const install = () => {
        changeStage({ action: 'installing', data: version })
    }

    const SearchInstaller: React.FC<InstallerProps> = ({ allowDisable = false }) => {
        const { t } = useTranslation('../../../internal/appliance/frontend/maintenance/src')

        return (
            <Paper
                sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    width: '100%',
                    gap: 2,
                }}
                onClick={allowDisable ? () => setInstallSearch(prevSarch => !prevSarch) : undefined}
            >
                <img src={search} />
                <Stack sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">
                        <b>{t('search-suite')}</b>
                    </Typography>
                    <Typography variant="caption">
                        {t('sourcegraph-search-suite-description')}
                        <br />
                        {t('batch-changes-and-own')}
                    </Typography>
                </Stack>
                <Checkbox sx={{ p: 0 }} color="default" size="small" checked={installSearch} />
            </Paper>
        )
    }

    const allowInstall = installSearch

    return (
        <div className="install">
            <Typography variant="h5">{t('install-sourcegraph-appliance')}</Typography>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Stack direction="column" spacing={2} sx={{ alignItems: 'center' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel id="demo-simple-select-label">{t('version-label')}</InputLabel>
                        <Select
                            value={version}
                            label="Age"
                            onChange={e => setVersion(e.target.value)}
                            sx={{ width: 200 }}
                        >
                            <MenuItem value={'5.3.1'}>5.3.1</MenuItem>
                            <MenuItem value={'5.4.0'}>{t('version-5-4-0-merge-demo-only')}</MenuItem>
                            <MenuItem value={'5.4.1 (beta)'}>{t('version-5-4-0-beta-merge-demo-only')}</MenuItem>
                        </Select>
                    </FormControl>
                    <Typography variant="subtitle1">{t('select-components-to-install')}</Typography>
                    <div className="components">
                        <SearchInstaller allowDisable={false} />
                    </div>
                    <div className="message">
                        {allowInstall ? (
                            <Typography variant="caption">{t('press-install-to-begin')}</Typography>
                        ) : (
                            <Typography variant="caption" color="error">
                                {t('select-at-least-one-component')}
                            </Typography>
                        )}
                    </div>
                    <Button variant="contained" sx={{ width: 200 }} onClick={install} disabled={!allowInstall}>
                        {t('install-button')}
                    </Button>
                </Stack>
            </Paper>
        </div>
    )
}
