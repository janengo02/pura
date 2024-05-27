import { useState } from 'react'

export function useHover(initialState = false) {
   const [isHovered, setIsHovered] = useState(initialState)
   const start = () => {
      setIsHovered(true)
   }
   const end = () => {
      setIsHovered(false)
   }

   return {
      isHovered,
      start,
      end
   }
}
