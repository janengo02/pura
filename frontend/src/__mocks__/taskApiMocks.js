// Mock functions for RTK Query hooks used in TaskModal
export const mockDeleteTaskMutation = jest.fn()
export const mockUpdateTaskBasicMutation = jest.fn()

export const useDeleteTaskMutation = () => [mockDeleteTaskMutation]
export const useUpdateTaskBasicMutation = () => [mockUpdateTaskBasicMutation]

// Mock translation hook
export const useReactiveTranslation = () => ({
  t: (key) => {
    const translations = {
      'placeholder-untitled': 'Untitled',
      'placeholder-add-note': 'Add a note...',
      'btn-delete-task': 'Delete Task',
      'label-note': 'Note'
    }
    return translations[key] || key
  }
})

// Clear all mocks function for tests
export const clearAllMocks = () => {
  mockDeleteTaskMutation.mockClear()
  mockUpdateTaskBasicMutation.mockClear()
}