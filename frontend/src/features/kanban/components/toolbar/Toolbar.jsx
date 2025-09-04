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
import { useCreateTaskMutation, useShowTaskModalMutation } from '../../../task/api/taskApi'

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
      const [showTaskModalMutation] = useShowTaskModalMutation()

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

      const handleCreateTaskModal = useCallback(
         async (e) => {
            e.preventDefault()
            if (groupOrder.length > 0 && progressOrder.length > 0) {
               const result = await createTaskMutation(newTaskInfo).unwrap()
               if (result?.data?.task?.id) {
                  const taskData = {
                     pageId: id,
                     taskId: result.data.task.id
                  }
                  await showTaskModalMutation(taskData)
               }

            }
         },
         [createTaskMutation, showTaskModalMutation, newTaskInfo, groupOrder, progressOrder, id]
      )

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      return (
         <Flex
            w='full'
            maxW={802}
            paddingY={5}
            paddingX={3}
            alignItems='center'
         >
            {/* Left Section - Controls */}
            <Flex gap={2} alignItems='center'>
               <Filter />
            </Flex>

            <Spacer w={5} />

            {/* Right Section - Actions */}
            <Flex gap={5} alignItems='center'>
               <Settings />
               <Button
                  size='md'
                  colorScheme='purple'
                  leftIcon={<PiPlusCircleFill size={18} />}
                  onClick={handleCreateTaskModal}
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
