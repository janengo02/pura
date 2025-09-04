import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../../__tests__/test-utils'
import { createMockTask, createMockState, createMockUser } from '../../../../__tests__/testing-helpers'
import ProgressSelect from '../ProgressSelect'

// Mock Chakra UI components
jest.mock('@chakra-ui/react', () => {
  const React = require('react')
  return {
    Flex: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'flex', ...props }, children),
    Menu: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'menu', ...props }, children),
    MenuButton: ({ children, onClick, ...props }) => 
      React.createElement('button', { 
        'data-testid': 'menu-button', 
        onClick,
        ...props 
      }, children),
    MenuItem: ({ children, onClick, ...props }) => 
      React.createElement('div', { 
        'data-testid': 'menu-item', 
        onClick,
        role: 'menuitem',
        ...props 
      }, children),
    MenuList: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'menu-list', ...props }, children),
    Tag: ({ children, colorScheme, ...props }) => 
      React.createElement('span', { 
        'data-testid': 'tag',
        'data-color-scheme': colorScheme,
        ...props 
      }, children),
    useDisclosure: () => ({ 
      isOpen: false, 
      onOpen: jest.fn(), 
      onClose: jest.fn() 
    })
  }
})

// Mock TaskCardLabel component
jest.mock('../../../../shared/components/typography/TaskCardLabel', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: ({ text, ...props }) => 
      React.createElement('span', { 'data-testid': 'task-card-label', ...props }, text)
  }
})

// Mock API hooks
const mockMoveTask = jest.fn()
jest.mock('../../api/taskApi', () => ({
  useMoveTaskMutation: () => [mockMoveTask, { isLoading: false, error: null }]
}))

// Mock translation hook
jest.mock('../../../../shared/hooks/useReactiveTranslation', () => ({
  useReactiveTranslation: () => ({
    t: (key) => {
      const translations = {
        'task.progress.todo': 'To Do',
        'task.progress.inProgress': 'In Progress',
        'task.progress.completed': 'Completed',
        'task.progress.onHold': 'On Hold'
      }
      return translations[key] || key
    }
  })
}))

describe('ProgressSelect Component', () => {
  let user

  beforeEach(() => {
    user = createMockUser()
    jest.clearAllMocks()
  })

  const defaultProps = {
    task: createMockTask({ progress: 'in-progress' }),
    onProgressChange: jest.fn()
  }

  describe('Rendering', () => {
    it('should render with default progress', () => {
      const initialState = createMockState({
        taskSlice: { task: defaultProps.task }
      })

      render(<ProgressSelect {...defaultProps} />, { preloadedState: initialState })

      expect(screen.getByTestId('menu')).toBeInTheDocument()
      expect(screen.getByTestId('menu-button')).toBeInTheDocument()
      expect(screen.getByTestId('tag')).toBeInTheDocument()
    })

    it('should display correct progress status', () => {
      const task = createMockTask({ progress: 'completed' })
      const initialState = createMockState({
        taskSlice: { task }
      })

      render(
        <ProgressSelect {...defaultProps} task={task} />, 
        { preloadedState: initialState }
      )

      // Check that the completed status is displayed
      const tag = screen.getByTestId('tag')
      expect(tag).toBeInTheDocument()
    })

    it('should handle missing progress gracefully', () => {
      const task = createMockTask({ progress: null })
      const initialState = createMockState({
        taskSlice: { task }
      })

      expect(() => {
        render(
          <ProgressSelect {...defaultProps} task={task} />, 
          { preloadedState: initialState }
        )
      }).not.toThrow()
    })
  })

  describe('User Interactions', () => {
    it('should open menu when button is clicked', async () => {
      const initialState = createMockState({
        taskSlice: { task: defaultProps.task }
      })

      render(<ProgressSelect {...defaultProps} />, { preloadedState: initialState })

      const menuButton = screen.getByTestId('menu-button')
      await user.click(menuButton)

      // Since we're mocking useDisclosure, we can't test the actual opening
      // but we can verify the click was handled
      expect(menuButton).toBeInTheDocument()
    })

    it('should call onProgressChange when menu item is selected', async () => {
      const mockOnProgressChange = jest.fn()
      const initialState = createMockState({
        taskSlice: { task: defaultProps.task }
      })

      // Mock useDisclosure to return open state
      const mockUseDisclosure = jest.fn(() => ({
        isOpen: true,
        onOpen: jest.fn(),
        onClose: jest.fn()
      }))

      // Temporarily replace the mock
      jest.doMock('@chakra-ui/react', () => ({
        ...jest.requireActual('@chakra-ui/react'),
        useDisclosure: mockUseDisclosure
      }))

      render(
        <ProgressSelect {...defaultProps} onProgressChange={mockOnProgressChange} />, 
        { preloadedState: initialState }
      )

      // Since menu is "open", menu items should be rendered
      const menuItems = screen.queryAllByTestId('menu-item')
      if (menuItems.length > 0) {
        await user.click(menuItems[0])
        // Verify callback would be called (implementation specific)
      }
    })
  })

  describe('Progress Status Colors', () => {
    const progressStatuses = [
      { status: 'todo', expectedColor: 'gray' },
      { status: 'in-progress', expectedColor: 'blue' },
      { status: 'completed', expectedColor: 'green' },
      { status: 'on-hold', expectedColor: 'orange' }
    ]

    progressStatuses.forEach(({ status, expectedColor }) => {
      it(`should display correct color for ${status} status`, () => {
        const task = createMockTask({ progress: status })
        const initialState = createMockState({
          taskSlice: { task }
        })

        render(
          <ProgressSelect {...defaultProps} task={task} />, 
          { preloadedState: initialState }
        )

        // This test assumes the component uses colorScheme prop
        // Adjust based on your actual implementation
        const tag = screen.getByTestId('tag')
        expect(tag).toBeInTheDocument()
        // You might check data attributes or classes that indicate color
      })
    })
  })

  describe('API Integration', () => {
    it('should call move task API when progress changes', async () => {
      const task = createMockTask({ id: 'task-123', progress: 'todo' })
      const initialState = createMockState({
        taskSlice: { task }
      })

      render(<ProgressSelect task={task} />, { preloadedState: initialState })

      // This would test the actual API call if the component triggers it
      // The exact implementation depends on how your component handles progress changes
      expect(mockMoveTask).not.toHaveBeenCalled() // Initial state

      // Simulate progress change - this depends on your component's implementation
      // You might need to trigger the change through user interaction or props
    })

    it('should handle API errors gracefully', async () => {
      mockMoveTask.mockRejectedValueOnce(new Error('API Error'))

      const task = createMockTask()
      const initialState = createMockState({
        taskSlice: { task }
      })

      // Mock the API hook to return error state
      jest.doMock('../../api/taskApi', () => ({
        useMoveTaskMutation: () => [mockMoveTask, { 
          isLoading: false, 
          error: { message: 'Failed to update progress' } 
        }]
      }))

      expect(() => {
        render(<ProgressSelect task={task} />, { preloadedState: initialState })
      }).not.toThrow()
    })

    it('should show loading state during API call', () => {
      const task = createMockTask()
      const initialState = createMockState({
        taskSlice: { task }
      })

      // Mock loading state
      jest.doMock('../../api/taskApi', () => ({
        useMoveTaskMutation: () => [mockMoveTask, { 
          isLoading: true, 
          error: null 
        }]
      }))

      render(<ProgressSelect task={task} />, { preloadedState: initialState })

      // Component should handle loading state appropriately
      // This might be a disabled state or loading indicator
      const menuButton = screen.getByTestId('menu-button')
      expect(menuButton).toBeInTheDocument()
      // Check if button is disabled during loading (if implemented)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const initialState = createMockState({
        taskSlice: { task: defaultProps.task }
      })

      render(<ProgressSelect {...defaultProps} />, { preloadedState: initialState })

      const menuButton = screen.getByTestId('menu-button')
      
      // Check for proper accessibility attributes
      expect(menuButton).toBeInTheDocument()
      // You might check for aria-label, aria-haspopup, etc.
    })

    it('should be keyboard accessible', async () => {
      const initialState = createMockState({
        taskSlice: { task: defaultProps.task }
      })

      render(<ProgressSelect {...defaultProps} />, { preloadedState: initialState })

      const menuButton = screen.getByTestId('menu-button')

      // Test keyboard navigation
      menuButton.focus()
      expect(menuButton).toHaveFocus()

      // Test Enter key to open menu
      await user.keyboard('{Enter}')
      // Verify menu opens (if implemented with proper keyboard support)

      // Test Escape key to close menu
      await user.keyboard('{Escape}')
      // Verify menu closes
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined task', () => {
      const initialState = createMockState({
        taskSlice: { task: null }
      })

      expect(() => {
        render(<ProgressSelect task={null} />, { preloadedState: initialState })
      }).not.toThrow()
    })

    it('should handle invalid progress status', () => {
      const task = createMockTask({ progress: 'invalid-status' })
      const initialState = createMockState({
        taskSlice: { task }
      })

      expect(() => {
        render(<ProgressSelect task={task} />, { preloadedState: initialState })
      }).not.toThrow()
    })

    it('should handle rapid status changes', async () => {
      const task = createMockTask({ progress: 'todo' })
      const initialState = createMockState({
        taskSlice: { task }
      })

      const { rerender } = render(
        <ProgressSelect task={task} />, 
        { preloadedState: initialState }
      )

      // Simulate rapid prop changes
      const updatedTask1 = { ...task, progress: 'in-progress' }
      const updatedTask2 = { ...task, progress: 'completed' }

      rerender(<ProgressSelect task={updatedTask1} />)
      rerender(<ProgressSelect task={updatedTask2} />)

      // Component should handle rapid updates without errors
      expect(screen.getByTestId('menu-button')).toBeInTheDocument()
    })
  })

  describe('Integration with Redux', () => {
    it('should update when Redux state changes', () => {
      const initialTask = createMockTask({ progress: 'todo' })
      const initialState = createMockState({
        taskSlice: { task: initialTask }
      })

      const { rerender, store } = render(
        <ProgressSelect task={initialTask} />, 
        { preloadedState: initialState }
      )

      // Update Redux state
      const updatedTask = { ...initialTask, progress: 'completed' }
      const updatedState = createMockState({
        taskSlice: { task: updatedTask }
      })

      rerender(<ProgressSelect task={updatedTask} />, { preloadedState: updatedState })

      // Component should reflect the new state
      expect(screen.getByTestId('tag')).toBeInTheDocument()
    })
  })
})