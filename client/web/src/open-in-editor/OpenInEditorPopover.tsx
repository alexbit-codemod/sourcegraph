import React, { useCallback } from 'react'

import { mdiClose } from '@mdi/js'
import { VisuallyHidden } from '@reach/visually-hidden'
import classNames from 'classnames'
import { useTranslation, Trans } from 'react-i18next'

import { Button, H3, Icon, Input, Link, Select, Text, Form, Code } from '@sourcegraph/wildcard'

import { isProjectPathValid } from './build-url'
import type { EditorSettings } from './editor-settings'
import { type EditorId, supportedEditors } from './editors'

import styles from './OpenInEditorPopover.module.scss'

export interface OpenInEditorPopoverProps {
    editorSettings?: EditorSettings
    togglePopover: () => void
    onSave: (selectedEditorId: EditorId, defaultProjectPath: string) => Promise<void>
    sourcegraphUrl: string
}

/**
 * A popover that displays a searchable list of revisions (grouped by type) for
 * the current repository.
 */
export const OpenInEditorPopover: React.FunctionComponent<
    React.PropsWithChildren<OpenInEditorPopoverProps>
> = props => {
    const { t } = useTranslation('open-in-editor')

    const { editorSettings, togglePopover } = props

    const [selectedEditorId, setSelectedEditorId] = React.useState<EditorId>(editorSettings?.editorIds?.[0] || '')
    const [defaultProjectPath, setDefaultProjectPath] = React.useState<string>(
        editorSettings?.['projectPaths.default'] || ''
    )
    const areSettingsValid = selectedEditorId && isProjectPathValid(defaultProjectPath)
    const [areValidSettingsSaved, setValidSettingsSaved] = React.useState<boolean>(false)

    const handleEditorChange = useCallback<React.ChangeEventHandler<HTMLSelectElement>>(event => {
        setSelectedEditorId(event.target.value)
    }, [])

    const onSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
        event => {
            event.preventDefault()

            props
                .onSave(selectedEditorId || '', defaultProjectPath || '')
                .then(() => {
                    setValidSettingsSaved(true)
                })
                .catch(() => {
                    // TODO: Handle this failure nicely
                }) // Fallback values are only for TS
        },
        [defaultProjectPath, props, selectedEditorId]
    )

    const onProjectPathChange = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
        event.preventDefault()
        setDefaultProjectPath(event.target.value)
    }, [])

    return (
        <div className={styles.openInEditorPopover}>
            <Button className={styles.close} onClick={togglePopover}>
                <VisuallyHidden>{t('close-button')}</VisuallyHidden>
                <Icon svgPath={mdiClose} inline={false} aria-hidden={true} />
            </Button>
            {(!areValidSettingsSaved ? renderForm : renderDone)()}
        </div>
    )

    function renderForm(): React.ReactNode {
        return (
            <>
                <H3>{t('preferred-editor-setting')}</H3>
                <Text>{t('editor-integration-instructions')}</Text>

                <Form onSubmit={onSubmit} noValidate={true}>
                    <Input
                        id="OpenInEditorForm-projectPath"
                        type="text"
                        label={t('default-projects-path-label')}
                        name="projectPath"
                        placeholder={t('default-projects-path-example')}
                        required={true}
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        readOnly={false}
                        value={defaultProjectPath}
                        onChange={onProjectPathChange}
                        className={classNames('mr-sm-2')}
                    />
                    <aside className="small text-muted">
                        {t('repository-checkout-directory-instructions')}
                        <Code>{t('example-repository-path')}</Code>
                        {t('set-default-projects-path-instructions')}
                        <Code>{t('default-projects-path')}</Code>.
                    </aside>
                    <Select
                        id="OpenInEditorForm-editor"
                        label="Editor"
                        message={
                            <>
                                <Trans
                                    i18nKey="alternative-editor-setup-link"
                                    components={{
                                        '0': (
                                            <Link
                                                to="/help/integration/open_in_editor"
                                                target="_blank"
                                                rel="noreferrer noopener"
                                            />
                                        ),
                                    }}
                                />
                            </>
                        }
                        value={selectedEditorId}
                        onChange={handleEditorChange}
                        className={styles.editorSelect}
                    >
                        <option value="" />
                        {[...supportedEditors]
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .filter(editor => editor.id !== 'custom')
                            .map(editor => (
                                <option key={editor.id} value={editor.id}>
                                    {editor.name}
                                </option>
                            ))}
                    </Select>
                    <Button variant="primary" type="submit" disabled={!areSettingsValid}>
                        {t('save-button')}
                    </Button>
                </Form>
            </>
        )
    }

    function renderDone(): React.ReactNode {
        return (
            <>
                <H3>{t('setup-completion-message')}</H3>
                <Text>
                    <Trans
                        i18nKey="modify-editor-paths-instructions"
                        components={{
                            '0': (
                                <Link
                                    to={props.sourcegraphUrl + '/user/settings'}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                />
                            ),
                        }}
                    />
                </Text>
                <Button variant="primary" onClick={togglePopover}>
                    {t('close-message')}
                </Button>
            </>
        )
    }
}
