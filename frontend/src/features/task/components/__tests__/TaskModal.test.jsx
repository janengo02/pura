import React from 'react'
import { screen } from '@testing-library/react'
import { render } from '../../../../__tests__/test-utils'
import TaskModal from '../TaskModal'

// Mock Chakra UI components
jest.mock('@chakra-ui/react', () => {
  const React = require('react')
  return {
    Box: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'box', ...props }, children),
    Card: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'card', ...props }, children),
    CardBody: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'card-body', ...props }, children),
    CardHeader: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'card-header', ...props }, children),
    IconButton: ({ children, ...props }) => React.createElement('button', { 'data-testid': 'icon-button', ...props }, children),
    Menu: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'menu', ...props }, children),
    MenuButton: ({ children, ...props }) => React.createElement('button', { 'data-testid': 'menu-button', ...props }, children),
    MenuItem: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'menu-item', ...props }, children),
    MenuList: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'menu-list', ...props }, children),
    ScaleFade: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'scale-fade', ...props }, children),
    VStack: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'vstack', ...props }, children),
    useDisclosure: () => ({ isOpen: false, onOpen: jest.fn(), onClose: jest.fn() })
  }
})

// Mock react-quill
jest.mock('react-quill', () => {
  const React = require('react')
  return React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      getEditor: () => ({
        root: {
          innerHTML: props.value || '',
          addEventListener: jest.fn(),
          removeEventListener: jest.fn()
        }
      })
    }))
    
    return React.createElement('div', {
      'data-testid': 'react-quill',
      children: 'Mocked ReactQuill'
    })
  })
})

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  FormProvider: ({ children }) => children,
  useForm: () => ({
    resolver: jest.fn(),
    mode: 'onChange'
  })
}))

jest.mock('../../api/taskApi', () => ({
  useDeleteTaskMutation: () => [jest.fn()],
  useUpdateTaskBasicMutation: () => [jest.fn()]
}))

jest.mock('../../../../shared/hooks/useReactiveTranslation', () => ({
  useReactiveTranslation: () => ({
    t: (key) => key
  })
}))

// Mock child components
jest.mock('../ProgressSelect', () => {
  const React = require('react')
  return () => React.createElement('div', { 'data-testid': 'progress-select' }, 'Progress Select')
})

jest.mock('../GroupSelect', () => {
  const React = require('react')
  return () => React.createElement('div', { 'data-testid': 'group-select' }, 'Group Select')
})

jest.mock('../ScheduleSelect', () => {
  const React = require('react')
  return () => React.createElement('div', { 'data-testid': 'schedule-select' }, 'Schedule Select')
})

// Mock form components
jest.mock('../../../../shared/components/formInput/MultiInput', () => {
  const React = require('react')
  return {
    MultiInput: React.forwardRef((props, ref) => 
      React.createElement('input', {
        ref: ref,
        'data-testid': 'multi-input',
        value: props.value || '',
        onChange: props.onChange,
        placeholder: props.placeholder
      })
    )
  }
})

jest.mock('../../../../shared/components/typography/TaskCardLabel', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: ({ text }) => React.createElement('div', { 'data-testid': 'task-card-label' }, text)
  }
})

// Sample task data
const sampleTask = {
  id: 'task-1',
  title: 'Sample Task',
  content: '<p>Sample content</p>',
  progress: 'in-progress',
  group: 'work'
}

// Helper to create initial state
const createInitialState = (task = null, pageId = 'page-1') => ({
  taskSlice: { task },
  pageSlice: { id: pageId },
  auth: { token: null },
  alert: { alerts: [] },
  language: { current: 'en' },
  theme: { mode: 'light' },
  event: { events: [] },
  calendarSlice: { calendar: null }
})

describe('TaskModal', () => {
  it('should not render when no task is selected', () => {
    const initialState = createInitialState(null)
    const { container } = render(<TaskModal />, { preloadedState: initialState })
    expect(container.firstChild).toBeNull()
  })

  it('should render when a task is selected', () => {
    const initialState = createInitialState(sampleTask)
    render(<TaskModal />, { preloadedState: initialState })
    
    expect(screen.getByTestId('multi-input')).toBeInTheDocument()
    expect(screen.getByTestId('react-quill')).toBeInTheDocument()
    expect(screen.getByTestId('progress-select')).toBeInTheDocument()
    expect(screen.getByTestId('group-select')).toBeInTheDocument()
    expect(screen.getByTestId('schedule-select')).toBeInTheDocument()
  })

  it('should display task title', () => {
    const initialState = createInitialState(sampleTask)
    render(<TaskModal />, { preloadedState: initialState })
    
    const input = screen.getByTestId('multi-input')
    expect(input).toHaveValue('Sample Task')
  })

  it('should handle task without title', () => {
    const taskWithoutTitle = { ...sampleTask, title: '' }
    const initialState = createInitialState(taskWithoutTitle)
    render(<TaskModal />, { preloadedState: initialState })
    
    const input = screen.getByTestId('multi-input')
    expect(input).toHaveValue('')
  })

  it('should render with custom leftWidth prop', () => {
    const initialState = createInitialState(sampleTask)
    render(<TaskModal leftWidth="50%" />, { preloadedState: initialState })
    
    expect(screen.getByTestId('multi-input')).toBeInTheDocument()
  })
})