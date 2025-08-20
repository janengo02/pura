// =============================================================================
// IMPORTS
// =============================================================================

import React, { createContext, useContext, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

// =============================================================================
// CONTEXT CREATION
// =============================================================================

const SessionContext = createContext()

// =============================================================================
// HOOK
// =============================================================================

export const useSession = () => {
   const context = useContext(SessionContext)
   if (!context) {
      throw new Error('useSession must be used within a SessionProvider')
   }
   return context
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export const SessionProvider = ({ children }) => {
   const [sessionModalState, setSessionModalState] = useState({
      isOpen: false,
      reason: 'expired'
   })

   // -------------------------------------------------------------------------
   // HANDLERS
   // -------------------------------------------------------------------------

   const showSessionExpiredModal = useCallback((reason = 'expired') => {
      setSessionModalState({
         isOpen: true,
         reason
      })
   }, [])

   const hideSessionModal = useCallback(() => {
      setSessionModalState((prev) => ({
         ...prev,
         isOpen: false
      }))
   }, [])

   // -------------------------------------------------------------------------
   // CONTEXT VALUE
   // -------------------------------------------------------------------------

   const value = {
      sessionModal: sessionModalState,
      showSessionExpiredModal,
      hideSessionModal
   }

   return (
      <SessionContext.Provider value={value}>
         {children}
      </SessionContext.Provider>
   )
}

// =============================================================================
// PROP TYPES
// =============================================================================

SessionProvider.propTypes = {
   children: PropTypes.node.isRequired
}
