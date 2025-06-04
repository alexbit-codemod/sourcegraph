import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslation } from 'react-i18next'
import { describe, expect, it } from 'vitest'

import { useSeriesToggle } from './use-series-toggle'

const UseSeriesToggleExample: React.FunctionComponent = () => {
    const { t } = useTranslation('insights/utils')

    const availableSeriesIds = ['foo', 'bar', 'baz']
    const { toggle, selectedSeriesIds, isSeriesHovered, isSeriesSelected, setHoveredId } = useSeriesToggle()

    return (
        <div>
            {availableSeriesIds.map(id => {
                const { t } = useTranslation('insights/utils')

                return (
                    <div key={id} onMouseEnter={() => setHoveredId(id)}>
                        {isSeriesSelected(id) && <span>{t('id-selected', { id })}</span>}
                        {isSeriesHovered(id) && <span>{t('id-hovered', { id })}</span>}
                        <button onClick={() => toggle(id, availableSeriesIds)}>{id}</button>
                    </div>
                )
            })}

            <div>
                {t('selected-series')}
                {selectedSeriesIds.join(',')}
            </div>
        </div>
    )
}

describe('useSeriesToggle', () => {
    it('renders all series when none are selected', () => {
        render(<UseSeriesToggleExample />)

        expect(screen.getByText('foo is selected')).toBeInTheDocument()
        expect(screen.getByText('bar is selected')).toBeInTheDocument()
    })

    it('renders only foo series when foo is selected', () => {
        render(<UseSeriesToggleExample />)
        userEvent.click(screen.getByRole('button', { name: 'foo' }))

        expect(screen.getByText('foo is selected')).toBeInTheDocument()
        expect(screen.queryByText('bar is selected')).not.toBeInTheDocument()
        expect(screen.getByText('Selected series: foo')).toBeInTheDocument()
    })

    it('renders only foo & bar series when foo & bar are selected', () => {
        render(<UseSeriesToggleExample />)
        userEvent.click(screen.getByRole('button', { name: 'foo' }))
        userEvent.click(screen.getByRole('button', { name: 'bar' }))

        expect(screen.getByText('foo is selected')).toBeInTheDocument()
        expect(screen.getByText('bar is selected')).toBeInTheDocument()
        expect(screen.getByText('Selected series: foo,bar')).toBeInTheDocument()
    })

    it('renders "foo is hovered"', () => {
        render(<UseSeriesToggleExample />)
        userEvent.hover(screen.getByRole('button', { name: 'foo' }))

        expect(screen.getByText('foo is hovered')).toBeInTheDocument()
    })

    it('renders "bar is hovered"', () => {
        render(<UseSeriesToggleExample />)
        userEvent.hover(screen.getByRole('button', { name: 'foo' }))
        userEvent.hover(screen.getByRole('button', { name: 'bar' }))

        expect(screen.queryByText('foo is hovered')).not.toBeInTheDocument()
        expect(screen.getByText('bar is hovered')).toBeInTheDocument()
    })

    it('deslects all series after user selects every series available', () => {
        render(<UseSeriesToggleExample />)
        userEvent.click(screen.getByRole('button', { name: 'foo' }))
        userEvent.click(screen.getByRole('button', { name: 'bar' }))
        userEvent.click(screen.getByRole('button', { name: 'baz' }))

        expect(screen.getByText('foo is selected')).toBeInTheDocument()
        expect(screen.getByText('bar is selected')).toBeInTheDocument()
        expect(screen.getByText('baz is selected')).toBeInTheDocument()
        expect(screen.queryByText('Selected series: foo,bar,baz')).not.toBeInTheDocument()
    })
})
