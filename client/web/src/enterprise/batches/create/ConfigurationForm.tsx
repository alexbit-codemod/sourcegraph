import React, { useCallback, useState } from 'react'

import classNames from 'classnames'
import { noop } from 'lodash'
import { useTranslation, Trans } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { useMutation } from '@sourcegraph/http-client'
import { Alert, Button, Container, ErrorAlert, Form, Input } from '@sourcegraph/wildcard'

import type {
    BatchChangeFields,
    CreateBatchSpecFromRawResult,
    CreateBatchSpecFromRawVariables,
    CreateEmptyBatchChangeResult,
    CreateEmptyBatchChangeVariables,
    Scalars,
} from '../../../graphql-operations'
import { NamespaceSelector } from '../../../namespaces/NamespaceSelector'
import { useAffiliatedNamespaces } from '../../../namespaces/useAffiliatedNamespaces'
import { useBatchChangesLicense } from '../useBatchChangesLicense'

import { CREATE_BATCH_SPEC_FROM_RAW, CREATE_EMPTY_BATCH_CHANGE } from './backend'

import styles from './ConfigurationForm.module.scss'

/* Regex pattern for a valid batch change name. Needs to match what's defined in the BatchSpec JSON schema. */
const NAME_PATTERN = /^[\w.-]+$/

type ConfigurationFormProps = {
    /**
     * When set, apply a template to the batch spec before redirecting to the edit page.
     */
    renderTemplate?: (title: string) => string
    /** The title of the insight this was created from, if any. */
    insightTitle?: string
    /**
     * When set, will pre-select the namespace with the given ID from the dropdown
     * selector, if an existing batch change is not available.
     */
    initialNamespaceID?: Scalars['ID']
} & (
    | // Either the form is editable and we may not have a batch change yet, or the form is
    // read-only and we definitely already have a batch change.
    {
          /**
           * Whether or not to display the configuration form in read-only mode, i.e. to view
           * for an existing batch change.
           */
          isReadOnly?: false
          /** The existing batch change to use to pre-populate the form. */
          batchChange?: Pick<BatchChangeFields, 'name' | 'namespace'>
      }
    | {
          /**
           * Whether or not to display the configuration form in read-only mode, i.e. to view
           * for an existing batch change.
           */
          isReadOnly: true
          /** The existing batch change to use to pre-populate the form. */
          batchChange: Pick<BatchChangeFields, 'name' | 'namespace'>
      }
)

export const ConfigurationForm: React.FunctionComponent<React.PropsWithChildren<ConfigurationFormProps>> = ({
    isReadOnly,
    batchChange,
    renderTemplate,
    insightTitle,
    initialNamespaceID,
}) => {
    const { t } = useTranslation('enterprise/batches/create')

    const [createEmptyBatchChange, { loading: batchChangeLoading, error: batchChangeError }] = useMutation<
        CreateEmptyBatchChangeResult,
        CreateEmptyBatchChangeVariables
    >(CREATE_EMPTY_BATCH_CHANGE)
    const [createBatchSpecFromRaw, { loading: batchSpecLoading, error: batchSpecError }] = useMutation<
        CreateBatchSpecFromRawResult,
        CreateBatchSpecFromRawVariables
    >(CREATE_BATCH_SPEC_FROM_RAW)

    // The set of namespaces the user has permissions to create batch changes in, and the
    // namespace among those that should be selected by default.
    const {
        namespaces,
        initialNamespace,
        loading: affiliatedNamespacesLoading,
        error: affiliatedNamespacesError,
    } = useAffiliatedNamespaces(initialNamespaceID)

    // If the user is creating a new batch change, this is the namespace selected.
    const [selectedNamespace, setSelectedNamespace] = useState<string | undefined>()
    const selectedNamespaceOrInitial = selectedNamespace ?? initialNamespace?.id

    // If the batch change already exists and we're in read-only mode, the namespace it
    // was created in is the only one we care about showing in the selector. The current
    // viewer may or may not have permissions to create batch changes in this namespace,
    // so it's important that we don't necessarily include it for the non-read-only
    // version.
    const namespaceSelector = isReadOnly ? (
        <NamespaceSelector
            namespaces={[batchChange.namespace]}
            value={batchChange.namespace.id}
            onSelect={noop}
            disabled={true}
        />
    ) : (
        <NamespaceSelector
            namespaces={namespaces}
            loading={affiliatedNamespacesLoading}
            value={selectedNamespaceOrInitial}
            onSelect={setSelectedNamespace}
        />
    )

    // When creating a batch change we want to disable the `Create` button, to avoid
    // users clicking on it again.
    const isButtonDisabled = batchChangeLoading || batchSpecLoading || affiliatedNamespacesLoading
    const error = batchChangeError || batchSpecError || affiliatedNamespacesError

    const [nameInput, setNameInput] = useState(batchChange?.name || '')
    const [isNameValid, setIsNameValid] = useState<boolean>()

    const onNameChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(event => {
        const newName = event.target.value.replaceAll(' ', '-')
        setNameInput(newName)
        setIsNameValid(NAME_PATTERN.test(newName))
    }, [])

    const { isUnlicensed, maxUnlicensedChangesets } = useBatchChangesLicense()

    const navigate = useNavigate()
    const location = useLocation()
    const handleCancel = (): void => navigate(-1)
    const handleCreate: React.FormEventHandler = (event): void => {
        event.preventDefault()
        const redirectSearchParameters = new URLSearchParams(location.search)
        if (insightTitle) {
            redirectSearchParameters.set('title', insightTitle)
        }
        let serializedRedirectSearchParameters = redirectSearchParameters.toString()
        if (serializedRedirectSearchParameters.length > 0) {
            serializedRedirectSearchParameters = '?' + serializedRedirectSearchParameters
        }
        if (selectedNamespaceOrInitial === undefined) {
            return
        }
        createEmptyBatchChange({
            variables: { namespace: selectedNamespaceOrInitial, name: nameInput },
        })
            .then(args => {
                if (!renderTemplate) {
                    return Promise.resolve(args)
                }

                const template = renderTemplate(nameInput)
                const batchChangeID = args.data?.createEmptyBatchChange.id

                return batchChangeID && template
                    ? createBatchSpecFromRaw({
                          variables: {
                              namespace: selectedNamespaceOrInitial,
                              spec: template,
                              batchChange: batchChangeID,
                          },
                      }).then(() => Promise.resolve(args))
                    : Promise.resolve(args)
            })
            .then(({ data }) =>
                data ? navigate(`${data.createEmptyBatchChange.url}/edit${serializedRedirectSearchParameters}`) : noop()
            )
            // We destructure and surface the error from `useMutation` instead.
            .catch(noop)
    }

    return (
        <Form className={styles.form} onSubmit={handleCreate}>
            <Container className="mb-4">
                {isUnlicensed && (
                    <Alert variant="info">
                        <div className="mb-2">
                            <strong>{t('license-changeset-limit', { maxUnlicensedChangesets })}</strong>
                        </div>
                        {t('batch-spec-execution-warning', { maxUnlicensedChangesets })}
                    </Alert>
                )}
                {error && <ErrorAlert error={error} />}
                {namespaceSelector}
                <Input
                    label={t('batch-change-name-label')}
                    value={nameInput}
                    onChange={onNameChange}
                    pattern="^[\w.-]+$"
                    required={true}
                    status={isNameValid === undefined ? undefined : isNameValid ? 'valid' : 'error'}
                    disabled={isReadOnly}
                />
                {!isReadOnly && (
                    <small className="text-muted">
                        <Trans
                            i18nKey="batch-change-name-description"
                            components={{
                                '0': <span className={classNames(isNameValid === false && 'text-danger')} />,
                            }}
                        />
                    </small>
                )}
            </Container>

            {!isReadOnly && (
                <div className={styles.ctaGroup}>
                    <Button variant="secondary" type="button" outline={true} onClick={handleCancel}>
                        {t('cancel-button')}
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        onClick={handleCreate}
                        aria-label={isNameValid ? undefined : 'Batch change name is invalid'}
                        disabled={isButtonDisabled || nameInput === '' || !isNameValid}
                    >
                        {t('create-button')}
                    </Button>
                </div>
            )}
        </Form>
    )
}
