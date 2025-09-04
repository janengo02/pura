import React from 'react'

// Mock ReactQuill component
const ReactQuill = React.forwardRef(({ value, onChange, placeholder, ...props }, ref) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  // Mock the getEditor method that TaskModal uses
  React.useImperativeHandle(ref, () => ({
    getEditor: () => ({
      root: {
        innerHTML: value || '',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      }
    })
  }))

  return (
    <textarea
      data-testid="react-quill"
      value={value || ''}
      onChange={handleChange}
      placeholder={placeholder}
      {...props}
    />
  )
})

ReactQuill.displayName = 'ReactQuill'

export default ReactQuill