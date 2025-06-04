import type { FunctionComponent } from 'react'

import { mdiChevronDown } from '@mdi/js'
import VisuallyHidden from '@reach/visually-hidden'
import { useTranslation } from 'react-i18next'

import {
    Button,
    ButtonGroup,
    Icon,
    Link,
    Menu,
    MenuButton,
    MenuLink,
    MenuList,
    Position,
    Text,
} from '@sourcegraph/wildcard'

import styles from './CreatePolicyButtons.module.scss'

interface CreatePolicyButtonsProps {
    repo?: { id: string; name: string }
}

export const CreatePolicyButtons: FunctionComponent<CreatePolicyButtonsProps> = ({ repo }) => {
    const { t } = useTranslation('enterprise/codeintel/configuration/components')

    return (
        <Menu>
            <ButtonGroup>
                <Button to="./new?type=head" variant="primary" as={Link}>
                    {t('create-new-global-policy', { repoGlobal: !repo && 'global' })}
                </Button>
                <MenuButton variant="primary" className={styles.dropdownButton}>
                    <Icon aria-hidden={true} svgPath={mdiChevronDown} />
                    <VisuallyHidden>{t('actions')}</VisuallyHidden>
                </MenuButton>
            </ButtonGroup>
            <MenuList position={Position.bottomEnd} className={styles.dropdownList}>
                <MenuLink as={Link} className={styles.dropdownItem} to="./new?type=head">
                    <>
                        <Text weight="medium" className="mb-2">
                            {t('create-new-head-policy', { repoGlobal: !repo && 'global' })}
                        </Text>
                        <Text className="mb-0 text-muted">{t('match-tip-default-branch', { repo })}</Text>
                    </>
                </MenuLink>
                <MenuLink as={Link} className={styles.dropdownItem} to="./new?type=branch">
                    <Text weight="medium" className="mb-2">
                        {t('create-new-global-branch-policy', { repoGlobal: !repo && 'global' })}
                    </Text>
                    <Text className="mb-0 text-muted">{t('match-multiple-branches', { repo })}</Text>
                </MenuLink>
                <MenuLink as={Link} className={styles.dropdownItem} to="./new?type=tag">
                    <Text weight="medium" className="mb-2">
                        {t('create-new-global-tag-policy', { repoGlobal: !repo && 'global' })}
                    </Text>
                    <Text className="mb-0 text-muted">{t('match-multiple-tags', { repo })}</Text>
                </MenuLink>
            </MenuList>
        </Menu>
    )
}
