import type { Meta, StoryFn } from '@storybook/react'
import { noop } from 'lodash'
import { useTranslation, Trans } from 'react-i18next'

import { BrandedStory } from '../../stories/BrandedStory'
import { Link } from '../Link'

import { Menu, MenuButton, MenuDivider, MenuHeader, MenuItem, MenuLink, MenuList } from '.'

const config: Meta = {
    title: 'wildcard/Menu',

    decorators: [story => <BrandedStory>{() => <div className="container mt-3">{story()}</div>}</BrandedStory>],

    parameters: {
        component: Menu,
        chromatic: {
            enableDarkMode: true,
            disableSnapshot: false,
        },
    },
}

export default config

export const MenuExample: StoryFn = () => {
    const { t } = useTranslation('../../wildcard/src/components/Menu')

    return (
        <Menu>
            <MenuButton variant="primary" outline={true}>
                <Trans i18nKey="actions-dropdown" components={{ '0': <span aria-hidden={true} /> }} />
            </MenuButton>

            <MenuList>
                <MenuHeader>{t('menu-description')}</MenuHeader>
                <MenuItem onSelect={() => alert('Clicked!')}>{t('click-button')}</MenuItem>
                <MenuItem onSelect={() => alert('Clicked!')}>{t('alternative-action')}</MenuItem>
                <MenuItem onSelect={noop} disabled={true}>
                    {t('disabled-message')}
                </MenuItem>
                <MenuDivider />
                <MenuLink as={Link} to="https://www.example.com">
                    {t('go-somewhere')}
                </MenuLink>
                <MenuLink disabled={true} as={Link} to="https://www.example.com">
                    {t('disabled-link')}
                </MenuLink>
            </MenuList>
        </Menu>
    )
}
