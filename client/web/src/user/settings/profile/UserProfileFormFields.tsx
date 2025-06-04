import React, { useCallback } from 'react'

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { UserAvatar } from '@sourcegraph/shared/src/components/UserAvatar'
import { Input, Label } from '@sourcegraph/wildcard'

import { USER_DISPLAY_NAME_MAX_LENGTH } from '../..'
import { UsernameInput } from '../../../auth/SignInSignUpCommon'
import type { EditUserProfilePage } from '../../../graphql-operations'

import styles from './UserProfileFormFields.module.scss'

export type UserProfileFormFieldsValue = Pick<EditUserProfilePage, 'username' | 'displayName' | 'avatarURL'>

interface Props {
    value: UserProfileFormFieldsValue
    onChange: (newValue: UserProfileFormFieldsValue) => void
    usernameFieldDisabled?: boolean
    displayNameFieldDisabled?: boolean
    disabled?: boolean
}

export const UserProfileFormFields: React.FunctionComponent<React.PropsWithChildren<Props>> = ({
    value,
    onChange,
    usernameFieldDisabled,
    displayNameFieldDisabled,
    disabled,
}) => {
    const { t } = useTranslation('user/settings/profile')

    const onUsernameChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        event => onChange({ ...value, username: event.target.value }),
        [onChange, value]
    )
    const onDisplayNameChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        event => onChange({ ...value, displayName: event.target.value }),
        [onChange, value]
    )
    const onAvatarURLChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        event => onChange({ ...value, avatarURL: event.target.value }),
        [onChange, value]
    )

    return (
        <div data-testid="user-profile-form-fields">
            <div className="form-group">
                <Label htmlFor="UserProfileFormFields__username">{t('username-label')}</Label>
                <UsernameInput
                    id="UserProfileFormFields__username"
                    className="test-UserProfileFormFields-username"
                    value={value.username}
                    onChange={onUsernameChange}
                    required={true}
                    disabled={usernameFieldDisabled || disabled}
                    aria-describedby="UserProfileFormFields__username-help"
                />
                <small id="UserProfileFormFields__username-help" className="form-text text-muted">
                    {t('username-requirements-description')}
                </small>
            </div>
            <Input
                id="UserProfileFormFields__displayName"
                data-testid="test-UserProfileFormFields__displayName"
                value={value.displayName || ''}
                onChange={onDisplayNameChange}
                disabled={displayNameFieldDisabled || disabled}
                spellCheck={false}
                placeholder={t('display-name-label')}
                maxLength={USER_DISPLAY_NAME_MAX_LENGTH}
                className="form-group"
                label={t('display-name-placeholder')}
            />

            <div className="d-flex align-items-center">
                <Input
                    id="UserProfileFormFields__avatarURL"
                    type="url"
                    value={value.avatarURL || ''}
                    onChange={onAvatarURLChange}
                    disabled={disabled}
                    spellCheck={false}
                    placeholder={t('avatar-photo-url-label')}
                    className="form-group w-100"
                    label={t('avatar-url-label')}
                />
                {value.avatarURL && <UserAvatar user={value} className={classNames('ml-2', styles.avatar)} />}
            </div>
        </div>
    )
}
