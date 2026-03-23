import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { AdSlot } from '@/components/ads/ad-slot'

describe('AdSlot component', () => {
  it('renders <ins> with className adsbygoogle', () => {
    const { container } = render(<AdSlot slotId="1234567890" />)
    const ins = container.querySelector('ins.adsbygoogle')
    expect(ins).not.toBeNull()
  })

  it('renders ins with data-ad-slot matching slotId prop', () => {
    const { container } = render(<AdSlot slotId="9876543210" />)
    const ins = container.querySelector('ins')
    expect(ins?.getAttribute('data-ad-slot')).toBe('9876543210')
  })

  it('wrapper div has minHeight 250px style', () => {
    const { container } = render(<AdSlot slotId="1234567890" />)
    // Find the div that wraps the ins element
    const ins = container.querySelector('ins')
    const wrapper = ins?.parentElement
    expect(wrapper?.style.minHeight).toBe('250px')
  })

  it('wrapper div has minWidth 300px style', () => {
    const { container } = render(<AdSlot slotId="1234567890" />)
    const ins = container.querySelector('ins')
    const wrapper = ins?.parentElement
    expect(wrapper?.style.minWidth).toBe('300px')
  })

  it('renders Advertisement label as a p element', () => {
    const { getByText } = render(<AdSlot slotId="1234567890" />)
    expect(getByText('Advertisement')).toBeTruthy()
  })
})
