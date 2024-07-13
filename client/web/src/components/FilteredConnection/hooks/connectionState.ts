import { useCallback, useMemo, useRef, useState } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'

import { QUERY_KEY } from '../constants'
import type { Filter, FilterValues } from '../FilterControl'
import { getFilterFromURL, parseQueryInt, urlSearchParamsForFilteredConnection } from '../utils'

import { DEFAULT_PAGE_SIZE, type PaginatedConnectionQueryArguments } from './usePageSwitcherPagination'

/**
 * The value and a setter for the value of a GraphQL connection's params.
 */
export type UseConnectionStateResult<TState extends PaginatedConnectionQueryArguments> = [
    connectionState: TState,

    /**
     * Set the {@link UseConnectionStateResult.connectionState} value in a callback that receives the current
     * value as an argument. Usually callers to {@link UseConnectionStateResult.setConnectionState} will
     * want to merge values (like `updateValue(prev => ({...prev, ...newValue}))`).
     */
    setConnectionState: (valueFunc: (current: TState) => TState) => void
]

/**
 * A React hook for using the URL querystring to store the state of a paginated connection,
 * including both pagination parameters (such as `first` and `after`) and other custom filter
 * parameters.
 */
export function useUrlSearchParamsForConnectionState<TFilterKeys extends string>(
    filters?: Filter<TFilterKeys>[],
    pageSize?: number
): UseConnectionStateResult<Record<TFilterKeys | 'query', string> & PaginatedConnectionQueryArguments> {
    type TState = Record<TFilterKeys | 'query', string> & PaginatedConnectionQueryArguments

    const location = useLocation()
    const navigate = useNavigate()

    pageSize = pageSize ?? DEFAULT_PAGE_SIZE

    const value = useRef<TState>()
    value.current = useMemo<TState>(() => {
        const params = new URLSearchParams(location.search)

        // The `first` and `last` params are omitted from the URL if they equal the default pageSize
        // to make the URL cleaner, so we need to resolve the actual value.
        const first =
            parseQueryInt(params, 'first') ??
            (params.has('after') || (!params.has('before') && !params.has('last')) ? pageSize : null)
        const last =
            parseQueryInt(params, 'last') ??
            (params.has('before') && !params.has('after') && !params.has('first') ? pageSize : null)

        return {
            ...(filters ? getFilterFromURL<TFilterKeys>(params, filters) : undefined),
            query: params.get(QUERY_KEY) ?? '',
            first,
            last,
            after: params.get('after') ?? undefined,
            before: params.get('before') ?? undefined,
        } as TState
    }, [location.search, pageSize, filters])

    const locationRef = useRef<typeof location>(location)
    locationRef.current = location
    const setValue = useCallback(
        (valueFunc: (current: TState) => TState) => {
            const location = locationRef.current
            const newValue = valueFunc(value.current!)
            const params = urlSearchParamsForFilteredConnection({
                pagination: {
                    first: newValue.first,
                    last: newValue.last,
                    after: newValue.after,
                    before: newValue.before,
                },
                pageSize,
                filters,
                filterValues: newValue as FilterValues<TFilterKeys>,
                query: 'query' in newValue ? newValue.query : '',
                search: location.search,
            })
            navigate(
                {
                    search: params.toString(),
                    hash: location.hash,
                },
                {
                    replace: true,
                    state: location.state, // Preserve flash messages.
                }
            )
        },
        [filters, pageSize, navigate]
    )

    return [value.current, setValue]
}

/**
 * A React hook for using the provided connection state (usually from
 * {@link useUrlSearchParamsForConnectionState}) if defined, or otherwise falling back to an
 * in-memory connection state implementation that does not read from and write to the URL.
 */
export function useConnectionStateOrMemoryFallback<
    TFilterKeys extends string,
    TState extends PaginatedConnectionQueryArguments = Record<TFilterKeys | 'query', string> &
        PaginatedConnectionQueryArguments
>(state: UseConnectionStateResult<TState> | undefined): UseConnectionStateResult<TState> {
    const memoryState = useState<TState>({} as TState)
    return state ?? memoryState
}
