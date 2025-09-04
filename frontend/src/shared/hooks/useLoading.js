import { useState } from 'react'

export default function useLoading(callback) {
   const [isLoading, setLoading] = useState(false)

   const handleSubmit = async (...args) => {
      setLoading(true)

      try {
         return await callback(args)
      } catch (e) {
         throw new Error(e)
      } finally {
         setLoading(false)
      }
   }

   return [handleSubmit, isLoading]
}
