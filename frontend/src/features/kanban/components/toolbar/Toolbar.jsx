// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useCallback } from 'react'

// Redux
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'


// UI Components
import { Flex, Spacer, Button } from '@chakra-ui/react'

// Icons
import { PiPlusCircleFill } from 'react-icons/pi'

// Internal Components
import Settings from './Settings'
import Filter from './Filter'

// Utils
import { useReactiveTranslation } from '../../../../shared/hooks/useReactiveTranslation'
import { useCreateTaskMutation } from '../../../task/api/taskApi'

// =============================================================================
// SELECTORS
// =============================================================================

// Memoized selectors for better Redux performance
const selectPageData = createSelector(
   [
      (state) => state.pageSlice.id,
      (state) => state.pageSlice.groupOrder,
      (state) => state.pageSlice.progressOrder
   ],
   (id, groupOrder, progressOrder) => ({
      id,
      groupOrder,
      progressOrder
   })
)

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Toolbar = React.memo(() => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()

      // Redux selectors
      const { id, groupOrder, progressOrder } = useSelector(selectPageData)

      // RTK Query hooks
      const [createTaskMutation] = useCreateTaskMutation()

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      const newTaskInfo = useMemo(
         () => ({
            pageId: id,
            groupId: groupOrder[0]?.id || null,
            progressId: progressOrder[0]?.id || null
         }),
         [id, groupOrder, progressOrder]
      )

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleCreateTask = useCallback(
         async (e) => {
            e.preventDefault()
            if (groupOrder.length > 0 && progressOrder.length > 0) {
               await createTaskMutation(newTaskInfo)
            }
         },
         [createTaskMutation, newTaskInfo, groupOrder, progressOrder, id]
      )

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      return (
         <Flex
            w='full'
            maxW={712}
            paddingY={5}
            paddingLeft={3}
            paddingRight={4}
            alignItems='center'
         >
            {/* Left Section - Controls */}
            <Flex gap={2} alignItems='center'>
               <Filter />
            </Flex>

            <Spacer w={5} />

            {/* Right Section - Actions */}
            <Flex gap={5} alignItems='center'>
               <Button
                  size='md'
                  colorScheme='purple'
                  leftIcon={<PiPlusCircleFill size={18} />}
                  onClick={handleCreateTask}
               >
                  {t('btn-new')}
               </Button>
            </Flex>
         </Flex>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
Toolbar.displayName = 'Toolbar'

// PropTypes validation
Toolbar.propTypes = {}

// =============================================================================
// EXPORT
// =============================================================================

export default Toolbar
