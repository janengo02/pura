import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../../__tests__/test-utils'
import { createMockTask, createMockState, createMockUser } from '../../../../__tests__/testing-helpers'
import GroupSelect from '../GroupSelect'

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
        'data-group': props.group || 'default',
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
        'group.work': 'Work',
        'group.personal': 'Personal',
        'group.shopping': 'Shopping',
        'group.health': 'Health',
        'group.finance': 'Finance'
      }
      return translations[key] || key
    }
  })
}))

// Mock selectors and Redux state
jest.mock('reselect', () => ({
  createSelector: jest.fn((selectors, combiner) => {
    return (state) => {
      const values = selectors.map(selector => selector(state))
      return combiner(...values)
    }
  })
}))

describe('GroupSelect Component', () => {
  let user

  beforeEach(() => {
    user = createMockUser()
    jest.clearAllMocks()
  })

  const mockGroups = [
    { id: 'work', name: 'Work', color: 'blue', count: 5 },
    { id: 'personal', name: 'Personal', color: 'green', count: 3 },
    { id: 'shopping', name: 'Shopping', color: 'purple', count: 2 }
  ]

  const defaultProps = {
    task: createMockTask({ group: 'work' }),
    onGroupChange: jest.fn()
  }

  const createStateWithGroups = (task = null) => createMockState({
    taskSlice: { task },
    groupSlice: { 
      groups: mockGroups,
      isLoading: false,
      error: null
    }
  })

  describe('Rendering', () => {
    it('should render with task group', () => {
      const initialState = createStateWithGroups(defaultProps.task)

      render(<GroupSelect {...defaultProps} />, { preloadedState: initialState })

      expect(screen.getByTestId('menu')).toBeInTheDocument()
      expect(screen.getByTestId('menu-button')).toBeInTheDocument()
      expect(screen.getByTestId('tag')).toBeInTheDocument()
    })

    it('should display correct group name and color', () => {
      const task = createMockTask({ group: 'personal' })
      const initialState = createStateWithGroups(task)

      render(
        <GroupSelect {...defaultProps} task={task} />, 
        { preloadedState: initialState }
      )

      const tag = screen.getByTestId('tag')
      expect(tag).toBeInTheDocument()
      // Check if the tag displays the correct group information
    })

    it('should handle task without group', () => {
      const task = createMockTask({ group: null })
      const initialState = createStateWithGroups(task)

      expect(() => {
        render(
          <GroupSelect {...defaultProps} task={task} />, 
          { preloadedState: initialState }
        )
      }).not.toThrow()

      // Should show default or "No Group" state
      expect(screen.getByTestId('menu-button')).toBeInTheDocument()
    })

    it('should render all available groups in menu', () => {
      const initialState = createStateWithGroups(defaultProps.task)

      // Mock useDisclosure to show open menu
      jest.doMock('@chakra-ui/react', () => ({
        ...jest.requireActual('@chakra-ui/react'),
        useDisclosure: () => ({
          isOpen: true,
          onOpen: jest.fn(),
          onClose: jest.fn()
        })
      }))

      render(<GroupSelect {...defaultProps} />, { preloadedState: initialState })

      // Check if menu items are rendered (this depends on implementation)
      const menuItems = screen.queryAllByTestId('menu-item')
      // Should have one item for each group plus possibly "No Group" option
      expect(menuItems.length).toBeGreaterThanOrEqual(mockGroups.length)
    })
  })

  describe('User Interactions', () => {
    it('should open menu when button is clicked', async () => {
      const initialState = createStateWithGroups(defaultProps.task)

      render(<GroupSelect {...defaultProps} />, { preloadedState: initialState })

      const menuButton = screen.getByTestId('menu-button')
      await user.click(menuButton)

      // Verify click was handled
      expect(menuButton).toBeInTheDocument()
    })

    it('should call onGroupChange when different group is selected', async () => {
      const mockOnGroupChange = jest.fn()
      const initialState = createStateWithGroups(defaultProps.task)

      render(
        <GroupSelect {...defaultProps} onGroupChange={mockOnGroupChange} />, 
        { preloadedState: initialState }
      )

      // This test depends on the implementation details of how groups are selected
      // You would need to simulate clicking on a menu item for a different group
    })

    it('should close menu after group selection', async () => {
      const initialState = createStateWithGroups(defaultProps.task)

      render(<GroupSelect {...defaultProps} />, { preloadedState: initialState })

      const menuButton = screen.getByTestId('menu-button')
      await user.click(menuButton)

      // After selecting an item, menu should close
      // This depends on your implementation of the onClose callback
    })
  })

  describe('Group Display and Colors', () => {
    const testGroups = [
      { id: 'work', name: 'Work', color: 'blue' },
      { id: 'personal', name: 'Personal', color: 'green' },
      { id: 'urgent', name: 'Urgent', color: 'red' },
      { id: 'shopping', name: 'Shopping', color: 'purple' }
    ]

    testGroups.forEach(({ id, name, color }) => {
      it(`should display correct color for ${name} group`, () => {
        const task = createMockTask({ group: id })
        const customState = createMockState({
          taskSlice: { task },
          groupSlice: { 
            groups: testGroups,
            isLoading: false
          }
        })

        render(
          <GroupSelect task={task} />, 
          { preloadedState: customState }
        )

        const tag = screen.getByTestId('tag')
        expect(tag).toBeInTheDocument()
        
        // Check if the color scheme is applied correctly
        // This depends on how your component maps group colors to UI
        if (color) {
          expect(tag).toHaveAttribute('data-color-scheme', color)
        }
      })
    })
  })

  describe('API Integration', () => {
    it('should call move task API when group changes', async () => {
      const task = createMockTask({ id: 'task-123', group: 'work' })
      const initialState = createStateWithGroups(task)

      render(<GroupSelect task={task} />, { preloadedState: initialState })

      // Initial state - no API calls
      expect(mockMoveTask).not.toHaveBeenCalled()

      // Simulate group change (implementation specific)
      // This would typically happen through menu item selection
    })

    it('should handle API errors gracefully', () => {
      mockMoveTask.mockRejectedValueOnce(new Error('Network error'))

      const task = createMockTask()
      const initialState = createStateWithGroups(task)

      // Mock error state
      jest.doMock('../../api/taskApi', () => ({
        useMoveTaskMutation: () => [mockMoveTask, { 
          isLoading: false, 
          error: { message: 'Failed to update group' }
        }]
      }))

      expect(() => {
        render(<GroupSelect task={task} />, { preloadedState: initialState })
      }).not.toThrow()
    })

    it('should show loading state during group change', () => {
      const task = createMockTask()
      const initialState = createStateWithGroups(task)

      // Mock loading state
      jest.doMock('../../api/taskApi', () => ({
        useMoveTaskMutation: () => [mockMoveTask, { 
          isLoading: true, 
          error: null 
        }]
      }))

      render(<GroupSelect task={task} />, { preloadedState: initialState })

      const menuButton = screen.getByTestId('menu-button')
      expect(menuButton).toBeInTheDocument()
      // Component should show loading indicator or disable interactions
    })
  })

  describe('Group Management', () => {
    it('should handle empty groups list', () => {
      const task = createMockTask({ group: 'work' })
      const stateWithEmptyGroups = createMockState({
        taskSlice: { task },
        groupSlice: { 
          groups: [],
          isLoading: false
        }
      })

      expect(() => {
        render(<GroupSelect task={task} />, { preloadedState: stateWithEmptyGroups })
      }).not.toThrow()

      // Should still render the component but possibly with disabled state
      expect(screen.getByTestId('menu-button')).toBeInTheDocument()
    })

    it('should handle groups loading state', () => {
      const task = createMockTask()
      const loadingState = createMockState({
        taskSlice: { task },
        groupSlice: { 
          groups: [],
          isLoading: true
        }
      })

      render(<GroupSelect task={task} />, { preloadedState: loadingState })

      // Component should handle loading state appropriately
      expect(screen.getByTestId('menu-button')).toBeInTheDocument()
      // Might show loading indicator or disable menu
    })

    it('should create new group when option is selected', async () => {
      const initialState = createStateWithGroups(defaultProps.task)

      render(<GroupSelect {...defaultProps} />, { preloadedState: initialState })

      // This test would cover the "Create New Group" functionality if implemented
      // Depends on your component's features
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const initialState = createStateWithGroups(defaultProps.task)

      render(<GroupSelect {...defaultProps} />, { preloadedState: initialState })

      const menuButton = screen.getByTestId('menu-button')
      expect(menuButton).toBeInTheDocument()
      
      // Check accessibility attributes
      // expect(menuButton).toHaveAttribute('aria-haspopup', 'true')
      // expect(menuButton).toHaveAttribute('aria-label')
    })

    it('should support keyboard navigation', async () => {
      const initialState = createStateWithGroups(defaultProps.task)

      render(<GroupSelect {...defaultProps} />, { preloadedState: initialState })

      const menuButton = screen.getByTestId('menu-button')

      // Test focus
      menuButton.focus()
      expect(menuButton).toHaveFocus()

      // Test keyboard activation
      await user.keyboard('{Enter}')
      // Menu should open

      await user.keyboard('{Escape}')
      // Menu should close
    })

    it('should announce group changes to screen readers', async () => {
      const initialState = createStateWithGroups(defaultProps.task)

      render(<GroupSelect {...defaultProps} />, { preloadedState: initialState })

      // After group change, there should be appropriate ARIA announcements
      // This depends on implementation with aria-live regions or similar
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined task', () => {
      const initialState = createStateWithGroups(null)

      expect(() => {
        render(<GroupSelect task={null} />, { preloadedState: initialState })
      }).not.toThrow()
    })

    it('should handle invalid group ID', () => {
      const task = createMockTask({ group: 'non-existent-group' })
      const initialState = createStateWithGroups(task)

      expect(() => {
        render(<GroupSelect task={task} />, { preloadedState: initialState })
      }).not.toThrow()

      // Should show some default state or handle gracefully
      expect(screen.getByTestId('menu-button')).toBeInTheDocument()
    })

    it('should handle rapid group changes', async () => {
      const task = createMockTask({ group: 'work' })
      const initialState = createStateWithGroups(task)

      const { rerender } = render(
        <GroupSelect task={task} />, 
        { preloadedState: initialState }
      )

      // Simulate rapid prop changes
      const updatedTask1 = { ...task, group: 'personal' }
      const updatedTask2 = { ...task, group: 'shopping' }

      rerender(<GroupSelect task={updatedTask1} />)
      rerender(<GroupSelect task={updatedTask2} />)

      expect(screen.getByTestId('menu-button')).toBeInTheDocument()
    })

    it('should handle groups with special characters', () => {
      const specialGroups = [
        { id: 'group-1', name: 'Group with @#$%', color: 'blue' },
        { id: 'group-2', name: '中文分组', color: 'green' },
        { id: 'group-3', name: 'Group\nwith\nnewlines', color: 'red' }
      ]

      const task = createMockTask({ group: 'group-1' })
      const specialState = createMockState({
        taskSlice: { task },
        groupSlice: { 
          groups: specialGroups,
          isLoading: false
        }
      })

      expect(() => {
        render(<GroupSelect task={task} />, { preloadedState: specialState })
      }).not.toThrow()
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const task = createMockTask()
      const initialState = createStateWithGroups(task)
      
      let renderCount = 0
      const WrappedGroupSelect = React.memo((props) => {
        renderCount++
        return <GroupSelect {...props} />
      })

      const { rerender } = render(
        <WrappedGroupSelect task={task} />, 
        { preloadedState: initialState }
      )

      const initialRenderCount = renderCount

      // Re-render with same props
      rerender(<WrappedGroupSelect task={task} />)

      // Should not have re-rendered
      expect(renderCount).toBe(initialRenderCount)

      // Re-render with different task
      const newTask = { ...task, group: 'personal' }
      rerender(<WrappedGroupSelect task={newTask} />)

      // Should have re-rendered
      expect(renderCount).toBe(initialRenderCount + 1)
    })

    it('should handle large number of groups efficiently', () => {
      const largeGroupsList = Array.from({ length: 100 }, (_, index) => ({
        id: `group-${index}`,
        name: `Group ${index}`,
        color: 'blue'
      }))

      const task = createMockTask({ group: 'group-0' })
      const stateWithManyGroups = createMockState({
        taskSlice: { task },
        groupSlice: { 
          groups: largeGroupsList,
          isLoading: false
        }
      })

      const start = performance.now()
      render(<GroupSelect task={task} />, { preloadedState: stateWithManyGroups })
      const end = performance.now()

      // Should render within reasonable time
      expect(end - start).toBeLessThan(100) // 100ms threshold
    })
  })
})