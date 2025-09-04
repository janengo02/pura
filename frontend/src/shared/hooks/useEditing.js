import { useState } from 'react'

export function useEditing(initialState = false) {
   const [isEditing, setIsEditing] = useState(initialState)
   const start = () => {
      setIsEditing(true)
   }
   const end = () => {
      setIsEditing(false)
   }

   return {
      isEditing,
      start,
      end
   }
}
