import { render, screen } from '@testing-library/react'
import React from 'react'

// Simple test to verify Jest + React Testing Library setup
describe('Jest + React Testing Library Setup', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello Jest!</div>
    render(<TestComponent />)
    expect(screen.getByText('Hello Jest!')).toBeInTheDocument()
  })

  it('should have access to jest matchers', () => {
    expect(true).toBe(true)
    expect('hello').toMatch(/hello/)
    expect([1, 2, 3]).toHaveLength(3)
  })
})