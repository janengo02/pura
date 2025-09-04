// =============================================
// TESTING UTILITIES AND HELPERS
// =============================================

import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// =============================================
// DATA FACTORIES
// =============================================

/**
 * Creates a sample task with default values and optional overrides
 * @param {Object} overrides - Properties to override defaults
 * @returns {Object} Task object
 */
export const createMockTask = (overrides = {}) => ({
  id: `task-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Sample Task',
  content: '<p>Sample content</p>',
  progress: 'in-progress',
  group: 'work',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})

/**
 * Creates a list of mock tasks
 * @param {number} count - Number of tasks to create
 * @param {Object} baseOverrides - Base properties to apply to all tasks
 * @returns {Array} Array of task objects
 */
export const createMockTaskList = (count = 3, baseOverrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockTask({
      id: `task-${index + 1}`,
      title: `Task ${index + 1}`,
      ...baseOverrides
    })
  )
}

/**
 * Creates initial Redux state for testing
 * @param {Object} overrides - State overrides
 * @returns {Object} Redux state object
 */
export const createMockState = (overrides = {}) => ({
  taskSlice: {
    task: null,
    tasks: [],
    isLoading: false,
    error: null
  },
  pageSlice: { id: 'page-1' },
  auth: {
    token: 'fake-token',
    user: { id: 'user-1', email: 'test@example.com' }
  },
  alert: { alerts: [] },
  language: { current: 'en' },
  theme: { mode: 'light' },
  event: { events: [] },
  calendarSlice: { calendar: null },
  ...overrides
})

/**
 * Creates mock user for testing user interactions
 * @returns {Object} UserEvent instance
 */
export const createMockUser = () => userEvent.setup()

// =============================================
// CUSTOM QUERIES AND ASSERTIONS
// =============================================

/**
 * Custom queries for common elements
 */
export const queries = {
  // Form elements
  getTaskTitleInput: () => screen.getByTestId('multi-input'),
  getTaskContentEditor: () => screen.getByTestId('react-quill'),
  getProgressSelect: () => screen.getByTestId('progress-select'),
  getGroupSelect: () => screen.getByTestId('group-select'),
  getScheduleSelect: () => screen.getByTestId('schedule-select'),

  // Buttons and actions
  getDeleteButton: () => screen.getByTestId('delete-button'),
  getMenuButton: () => screen.getByTestId('menu-button'),

  // Loading states
  getLoadingSpinner: () => screen.queryByTestId('loading-spinner'),

  // Error states
  getErrorMessage: () => screen.queryByRole('alert'),

  // Lists and containers
  getTaskList: () => screen.getByTestId('task-list'),
  getTaskModal: () => screen.queryByTestId('task-modal')
}

/**
 * Custom matchers for common assertions
 */
export const assertions = {
  expectTaskToBeDisplayed: (task) => {
    expect(queries.getTaskTitleInput()).toHaveValue(task.title)
    if (task.content) {
      expect(queries.getTaskContentEditor()).toHaveValue(task.content)
    }
  },

  expectFormToBeEmpty: () => {
    expect(queries.getTaskTitleInput()).toHaveValue('')
    expect(queries.getTaskContentEditor()).toHaveValue('')
  },

  expectLoadingState: () => {
    expect(queries.getLoadingSpinner()).toBeInTheDocument()
  },

  expectErrorState: (errorMessage) => {
    const errorElement = queries.getErrorMessage()
    expect(errorElement).toBeInTheDocument()
    if (errorMessage) {
      expect(errorElement).toHaveTextContent(errorMessage)
    }
  }
}

// =============================================
// USER INTERACTION HELPERS
// =============================================

/**
 * Common user interactions
 */
export const interactions = {
  /**
   * Fills out task form with provided data
   * @param {Object} user - UserEvent instance
   * @param {Object} taskData - Task data to fill
   */
  fillTaskForm: async (user, taskData) => {
    if (taskData.title) {
      const titleInput = queries.getTaskTitleInput()
      await user.clear(titleInput)
      await user.type(titleInput, taskData.title)
    }

    if (taskData.content) {
      const contentEditor = queries.getTaskContentEditor()
      await user.clear(contentEditor)
      await user.type(contentEditor, taskData.content)
    }

    if (taskData.progress) {
      const progressSelect = queries.getProgressSelect()
      await user.selectOptions(progressSelect, taskData.progress)
    }

    if (taskData.group) {
      const groupSelect = queries.getGroupSelect()
      await user.selectOptions(groupSelect, taskData.group)
    }
  },

  /**
   * Submits a form by pressing Enter or clicking submit
   * @param {Object} user - UserEvent instance
   * @param {string} method - 'enter' or 'click'
   */
  submitForm: async (user, method = 'enter') => {
    if (method === 'enter') {
      await user.keyboard('{Enter}')
    } else {
      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)
    }
  },

  /**
   * Deletes a task using the delete menu
   * @param {Object} user - UserEvent instance
   */
  deleteTask: async (user) => {
    const menuButton = queries.getMenuButton()
    await user.click(menuButton)

    const deleteItem = screen.getByTestId('menu-item')
    await user.click(deleteItem)
  },

  /**
   * Opens task menu
   * @param {Object} user - UserEvent instance
   */
  openTaskMenu: async (user) => {
    const menuButton = queries.getMenuButton()
    await user.click(menuButton)
  }
}

// =============================================
// API MOCKING HELPERS
// =============================================

/**
 * Creates mock API responses
 */
export const mockApi = {
  /**
   * Creates mock successful API response
   * @param {*} data - Response data
   */
  successResponse: (data) => Promise.resolve({ data }),

  /**
   * Creates mock error API response
   * @param {string} message - Error message
   * @param {number} status - HTTP status code
   */
  errorResponse: (message = 'Something went wrong', status = 500) =>
    Promise.reject({
      response: {
        status,
        data: { message }
      }
    }),

  /**
   * Creates loading state mock
   */
  loadingResponse: () => new Promise(() => {}), // Never resolves to simulate loading

  /**
   * Mock functions for RTK Query hooks
   */
  mockRTKQuery: {
    useUpdateTaskBasicMutation: (mockFn) => [
      mockFn || jest.fn(),
      { isLoading: false, error: null }
    ],

    useDeleteTaskMutation: (mockFn) => [
      mockFn || jest.fn(),
      { isLoading: false, error: null }
    ],

    useGetTasksQuery: (data, loading = false, error = null) => ({
      data,
      isLoading: loading,
      error,
      refetch: jest.fn()
    })
  }
}

// =============================================
// ACCESSIBILITY TESTING HELPERS
// =============================================

/**
 * Accessibility testing utilities
 */
export const a11y = {
  /**
   * Checks if element has proper ARIA labels
   * @param {HTMLElement} element - Element to check
   * @param {string} expectedLabel - Expected aria-label
   */
  expectAriaLabel: (element, expectedLabel) => {
    expect(element).toHaveAttribute('aria-label', expectedLabel)
  },

  /**
   * Checks keyboard navigation
   * @param {Object} user - UserEvent instance
   * @param {HTMLElement[]} elements - Elements to navigate through
   */
  testKeyboardNavigation: async (user, elements) => {
    for (let i = 0; i < elements.length; i++) {
      await user.tab()
      expect(elements[i]).toHaveFocus()
    }
  },

  /**
   * Checks if form has proper labels
   * @param {HTMLElement} form - Form element
   */
  expectFormAccessibility: (form) => {
    const inputs = within(form).getAllByRole('textbox')
    inputs.forEach(input => {
      // Check for associated label or aria-label
      expect(
        input.getAttribute('aria-label') ||
        input.getAttribute('aria-labelledby') ||
        within(form).getByLabelText(input.name)
      ).toBeTruthy()
    })
  }
}

// =============================================
// COMPONENT TESTING PATTERNS
// =============================================

/**
 * Common test patterns for components
 */
export const testPatterns = {
  /**
   * Standard rendering test
   * @param {Function} Component - React component
   * @param {Object} props - Component props
   * @param {Object} state - Initial Redux state
   */
  testBasicRendering: (Component, props = {}, state = {}) => {
    const initialState = createMockState(state)
    const { render } = require('./test-utils')

    return render(<Component {...props} />, { preloadedState: initialState })
  },

  /**
   * Tests component with different prop combinations
   * @param {Function} Component - React component
   * @param {Array} propCombinations - Array of prop objects to test
   */
  testPropVariations: (Component, propCombinations) => {
    propCombinations.forEach((props, index) => {
      it(`should render correctly with props variation ${index + 1}`, () => {
        expect(() =>
          testPatterns.testBasicRendering(Component, props)
        ).not.toThrow()
      })
    })
  },

  /**
   * Tests component error boundaries
   * @param {Function} Component - React component
   * @param {Object} errorProps - Props that should cause error
   */
  testErrorBoundary: (Component, errorProps) => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      testPatterns.testBasicRendering(Component, errorProps)
    ).not.toThrow()

    consoleSpy.mockRestore()
  }
}

// =============================================
// PERFORMANCE TESTING HELPERS
// =============================================

/**
 * Performance testing utilities
 */
export const performance = {
  /**
   * Measures component render time
   * @param {Function} renderFn - Function that renders component
   */
  measureRenderTime: (renderFn) => {
    const start = performance.now()
    renderFn()
    const end = performance.now()
    return end - start
  },
}

// =============================================
// CLEANUP UTILITIES
// =============================================

/**
 * Test cleanup utilities
 */
export const cleanup = {
  /**
   * Clears all mocks and timers
   */
  clearAllMocks: () => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  },

  /**
   * Resets DOM state between tests
   */
  resetDOM: () => {
    document.body.innerHTML = ''
  }
}

// Export all utilities as default object for convenience
const testingHelpers = {
  createMockTask,
  createMockTaskList,
  createMockState,
  createMockUser,
  queries,
  assertions,
  interactions,
  mockApi,
  a11y,
  testPatterns,
  performance,
  cleanup
}

export default testingHelpers