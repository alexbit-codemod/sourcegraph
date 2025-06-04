import { useEffect, useState, type FC } from 'react'

import { mdiChevronDown } from '@mdi/js'
import { useTranslation, Trans } from 'react-i18next'

import type { TelemetryV2Props } from '@sourcegraph/shared/src/telemetry'
import {
    ButtonLink,
    H1,
    H2,
    Icon,
    Link,
    Menu,
    MenuButton,
    MenuItem,
    MenuLink,
    MenuList,
    Position,
    Text,
} from '@sourcegraph/wildcard'

import { CodyColorIcon } from '../chat/CodyPageIcon'
import { IntelliJIcon } from '../upsell/IntelliJ'
import { VSCodeIcon } from '../upsell/vs-code'

import styles from './CodyDashboardPage.module.scss'

interface SetupOption {
    icon: JSX.Element
    maker: string
    name: string
    setupLink: string
}

const setupOptions: SetupOption[] = [
    {
        icon: <VSCodeIcon className={styles.linkSelectorIcon} />,
        maker: 'Microsoft',
        name: 'VS Code',
        setupLink: 'https://sourcegraph.com/docs/cody/clients/install-vscode',
    },
    {
        icon: <IntelliJIcon className={styles.linkSelectorIcon} />,
        maker: 'JetBrains',
        name: 'IntelliJ',
        setupLink: 'https://sourcegraph.com/docs/cody/clients/install-jetbrains',
    },
]

interface CodyDashboardPageProps extends TelemetryV2Props {}

export const CodyDashboardPage: FC<CodyDashboardPageProps> = ({ telemetryRecorder }) => {
    const { t } = useTranslation('cody/dashboard')

    useEffect(() => {
        telemetryRecorder.recordEvent('cody.dashboard', 'view')
    }, [telemetryRecorder])

    const codySetupLink = 'https://sourcegraph.com/docs/cody'
    return !window.context?.codyEnabledOnInstance ? (
        // This page should not be linked from anywhere if Cody is disabled on the instance, but add
        // a check here just in case to avoid confusing users if they find their way here.
        <section className={styles.dashboardContainer}>
            <section className={styles.dashboardHero}>
                <H1 className={styles.dashboardHeroHeader}>{t('cody-not-enabled')}</H1>
                <Text className={styles.dashboardHeroTagline}>{t('contact-admin-unexpected')}</Text>
            </section>
        </section>
    ) : (
        <section className={styles.dashboardContainer}>
            {window.context?.codyEnabledForCurrentUser ? (
                <>
                    <section className={styles.dashboardHero}>
                        <CodyColorIcon className={styles.dashboardCodyIcon} />
                        <H1 className={styles.dashboardHeroHeader}>
                            <Trans
                                i18nKey="get-started-with-cody"
                                components={{ '0': <span className={styles.codyGradient} /> }}
                            />
                        </H1>
                        <Text className={styles.dashboardHeroTagline}>{t('welcome-to-cody')}</Text>
                    </section>
                    <section className={styles.dashboardOnboarding}>
                        <section className={styles.dashboardOnboardingIde}>
                            <Text className={styles.dashboardText}>{t('use-cody-in-editor')}</Text>
                            <LinkSelector options={setupOptions} />
                            <Text className="text-muted">
                                <Link to={codySetupLink} className={styles.dashboardOnboardingIdeInstallationLink}>
                                    {t('documentation-link')}
                                </Link>
                            </Text>
                        </section>
                        <section className={styles.dashboardOnboardingWeb}>
                            <Text className={styles.dashboardText}>{t('try-cody-on-web')}</Text>
                            <ButtonLink to="/cody/chat" outline={true} className={styles.dashboardOnboardingWebLink}>
                                <CodyColorIcon className={styles.dashboardOnboardingCodyIcon} />
                                <span>{t('cody-web')}</span>
                            </ButtonLink>
                        </section>
                    </section>
                </>
            ) : (
                <section className={styles.dashboardHero}>
                    <CodyColorIcon className={styles.dashboardCodyIcon} />
                    <H2 className={styles.dashboardHeroHeader}>
                        <Trans
                            i18nKey="no-access-to-cody"
                            components={{ '0': <span className={styles.codyGradient} /> }}
                        />
                    </H2>
                    <Text className={styles.dashboardHeroTagline}>
                        <Trans
                            i18nKey="enable-cody-for-user"
                            components={{
                                '0': (
                                    <Link to="/help/cody/clients/enable-cody-enterprise#enable-cody-only-for-some-users" />
                                ),
                            }}
                        />
                    </Text>
                </section>
            )}
        </section>
    )
}

interface LinkSelectorProps {
    options: SetupOption[]
}

const LinkSelector: FC<LinkSelectorProps> = ({ options }) => {
    const [firstOption] = options
    const [selectedOption, setSelectedOption] = useState<SetupOption>(firstOption)
    return (
        <section className={styles.linkSelectorContainer}>
            <Menu>
                <MenuLink
                    as={Link}
                    className={styles.linkSelectorInfo}
                    to={selectedOption.setupLink}
                    target="_blank"
                    rel="noreferrer"
                >
                    {selectedOption.icon}
                    <section>
                        <Text className={styles.linkSelectorOptionMaker}>{selectedOption.maker}</Text>
                        <Text className={styles.linkSelectorOptionName}>{selectedOption.name}</Text>
                    </section>
                </MenuLink>
                <MenuButton variant={undefined} className={styles.linkSelectorBtn}>
                    <Icon size="md" aria-hidden={true} svgPath={mdiChevronDown} />
                </MenuButton>

                <MenuList position={Position.bottomEnd} className={styles.linkSelectorDropdown}>
                    {options.map((option, index) => {
                        const { t } = useTranslation('cody/dashboard')

                        return (
                            <MenuItem
                                key={index}
                                className={styles.linkSelectorItem}
                                onSelect={() => setSelectedOption(option)}
                            >
                                <Text className="m-0">
                                    {t('install-cody-on')}
                                    {option.name}
                                </Text>
                            </MenuItem>
                        )
                    })}
                </MenuList>
            </Menu>
        </section>
    )
}
