import React, { useId, useState, useMemo, type PropsWithChildren } from 'react'

import { mdiClose } from '@mdi/js'
import { noop } from 'lodash'
import { useTranslation, Trans } from 'react-i18next'

import {
    Button,
    Icon,
    Text,
    Modal,
    H2,
    Form,
    MultiCombobox,
    ErrorAlert,
    MultiComboboxInput,
    MultiComboboxList,
    MultiComboboxOption,
    Link,
    MultiComboboxOptionText,
    Code,
    joinWithAnd,
} from '@sourcegraph/wildcard'

import { LoaderButton } from '../../../../components/LoaderButton'
import type { RoleFields, Scalars } from '../../../../graphql-operations'
import { prettifySystemRole } from '../../../../util/settings'
import { useGetUserRolesAndAllRoles, useSetRoles } from '../backend'

import styles from './RoleAssignmentModal.module.scss'

export interface RoleAssignmentModalProps {
    onCancel: () => void
    onSuccess: (user: { username: string }) => void
    user: { id: Scalars['ID']; username: string }
}

const prepareDisplayRole = (role: RoleFields): RoleFields => ({
    ...role,
    name: role.system ? prettifySystemRole(role.name) : role.name,
})

export const RoleAssignmentModal: React.FunctionComponent<RoleAssignmentModalProps> = ({
    onCancel,
    onSuccess,
    user,
}) => {
    const { t } = useTranslation('enterprise/site-admin/UserManagement/components')

    const labelID = 'RoleAssignment'

    const id = useId()
    const [searchTerm, setSearchTerm] = useState('')

    const {
        data,
        loading,
        error: getUserRolesError,
    } = useGetUserRolesAndAllRoles(user.id, data => {
        if (data.node?.__typename !== 'User') {
            throw new Error('User not found')
        }
        const userRoles = data.node.roles.nodes.map(prepareDisplayRole)
        const allRoles = data.roles.nodes.map(prepareDisplayRole)
        setSelectedRoles(userRoles)
        setAllRoles(allRoles)
    })

    const [selectedRoles, setSelectedRoles] = useState<RoleFields[]>([])
    // Use roles from cached data if it's available, as these will change infrequently.
    const [allRoles, setAllRoles] = useState<RoleFields[]>((data?.roles.nodes || []).map(prepareDisplayRole))

    const selectedRoleNames = useMemo(() => selectedRoles.map(role => role.name), [selectedRoles])
    const [setRoles, { loading: setRolesLoading, error: setRolesError }] = useSetRoles(() => onSuccess(user))
    const suggestions = useMemo(
        () =>
            allRoles.filter(
                role =>
                    !selectedRoleNames.includes(role.name) &&
                    !role.system &&
                    role.name.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [allRoles, selectedRoleNames, searchTerm]
    )

    const handleSubmit: React.FormEventHandler = (event): void => {
        event.preventDefault()
        const roleIDs = selectedRoles.map(role => role.id)
        setRoles({
            variables: {
                user: user.id,
                roles: roleIDs,
            },
        }).catch(noop)
    }

    const error = getUserRolesError || setRolesError

    return (
        <Modal position="center" aria-labelledby={labelID} className={styles.modal} onDismiss={onCancel}>
            <header className="mb-4">
                <div className={styles.headerTopLine}>
                    <H2 className="m-0 font-weight-normal" id={labelID}>
                        <Trans
                            i18nKey="manage-roles-for-user"
                            values={{ userUsername: <>{user.username}</> }}
                            components={{ '0': <strong /> }}
                        />
                    </H2>

                    <Button variant="icon" className={styles.closeButton} aria-label="Close" onClick={onCancel}>
                        <Icon aria-hidden={true} svgPath={mdiClose} />
                    </Button>
                </div>

                <Text className="mb-0">
                    <Trans i18nKey="roles-permissions-info" components={{ '0': <Link to="/site-admin/roles" /> }} />
                </Text>
            </header>

            <Form onSubmit={handleSubmit} className={styles.form}>
                {error && !loading && <ErrorAlert error={error} />}

                <MultiCombobox
                    selectedItems={selectedRoles}
                    getItemKey={item => item.id}
                    getItemName={item => item.name}
                    getItemIsPermanent={item => item.system}
                    onSelectedItemsChange={setSelectedRoles}
                    aria-label="Select role(s) to assign to user"
                    className={styles.roleCombobox}
                >
                    <MultiComboboxInput
                        id={id}
                        value={searchTerm}
                        autoFocus={true}
                        placeholder={t('search-roles-placeholder')}
                        status={loading ? 'loading' : 'initial'}
                        onChange={event => setSearchTerm(event.target.value)}
                    />

                    <MultiComboboxList items={suggestions} renderEmptyList={true} className={styles.suggestionsList}>
                        {items => (
                            <>
                                {items.map((item, index) => (
                                    <RoleSuggestionCard key={item.id} item={item} index={index} />
                                ))}
                                {items.length === 0 && (
                                    <span className={styles.zeroStateMessage}>
                                        {loading
                                            ? 'Loading...'
                                            : allRoles.length > 0
                                            ? 'No more roles to assign'
                                            : 'No roles found'}
                                    </span>
                                )}
                            </>
                        )}
                    </MultiComboboxList>
                </MultiCombobox>

                <footer className={styles.footer}>
                    <span className={styles.keyboardExplanation}>
                        <Trans i18nKey="navigate-results-instructions" components={{ '0': <kbd />, '1': <kbd /> }} />
                    </span>

                    <Button variant="secondary" className="ml-auto mr-2" onClick={onCancel}>
                        {t('cancel-action')}
                    </Button>
                    <LoaderButton
                        variant="primary"
                        loading={setRolesLoading}
                        label={t('update-button')}
                        alwaysShowLabel={true}
                        disabled={loading || setRolesLoading}
                        type="submit"
                    />
                </footer>
            </Form>
        </Modal>
    )
}

interface RoleSuggestionCardProps {
    item: RoleFields
    index: number
}

const RoleSuggestionCard: React.FunctionComponent<PropsWithChildren<RoleSuggestionCardProps>> = ({ item, index }) => (
    <MultiComboboxOption value={item.name} index={index} className={styles.suggestionCard}>
        <span>
            <MultiComboboxOptionText />
        </span>
        <small>
            {item.permissions.nodes.length === 0 && 'No permissions granted to this role.'}
            {joinWithAnd(
                item.permissions.nodes,
                item => (
                    <Code>
                        {item.namespace.toLowerCase()}:{item.action.toLowerCase()}
                    </Code>
                ),
                item => item.id,
                5
            )}
        </small>
    </MultiComboboxOption>
)
