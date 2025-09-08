// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useState, useCallback, useMemo } from 'react'

// Redux
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'

// RTK Query
import { useMoveTaskMutation } from '../api/taskApi'

// UI Components
import {
   Flex,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   Tag,
   useDisclosure
} from '@chakra-ui/react'

// Internal Components
import TaskCardLabel from '../../../shared/components/typography/TaskCardLabel'

// Utils & Icons
import { PiFlagBanner } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../shared/hooks/useReactiveTranslation'


// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectProgressSelectData = createSelector(
   [
      (state) => state.taskSlice.task,
      (state) => state.pageSlice.id,
      (state) => state.pageSlice.progressOrder
   ],
   (task, id, progressOrder) => ({
      task,
      id,
      progressOrder
   })
)

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ProgressSelect = React.memo(() => {
   // -------------------------------------------------------------------------
   // HOOKS & STATE
   // -------------------------------------------------------------------------
   const { t } = useReactiveTranslation()

   // Redux state
   const { task, id, progressOrder } = useSelector(selectProgressSelectData)

   // RTK Query hooks
   const [moveTaskMutation] = useMoveTaskMutation()

   const [hovered, setHovered] = useState(false)
   const tagSelect = useDisclosure()

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      // Memoize progress menu items to prevent unnecessary re-renders
      const progressMenuItems = useMemo(() => {
         return (
            progressOrder?.map((progress_item) => (
               <MenuItem
                  key={progress_item.id}
                  onClick={async (e) => {
                     e.preventDefault()
                     if (progress_item.id !== task.progress.id) {
                        moveTaskMutation({
                           pageId: id,
                           taskId: task.id,
                           progress: progress_item,
                           progressId: progress_item.id
                        })
                     }
                  }}
               >
                  <Tag
                     bg={progress_item.color}
                     color={progress_item.titleColor}
                  >
                     {progress_item.title}
                  </Tag>
               </MenuItem>
            )) || []
         )
      }, [progressOrder, task.progress.id, task.id, id, moveTaskMutation])

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleMouseEnter = useCallback((e) => {
         e.preventDefault()
         setHovered(true)
      }, [])

      const handleMouseLeave = useCallback((e) => {
         e.preventDefault()
         setHovered(false)
      }, [])

      // -------------------------------------------------------------------------
      // RENDER LOGIC
      // -------------------------------------------------------------------------

      // Early return if task is not available
      if (!task) {
         return null
      }

      return (
         <Flex w='full' gap={3} flexWrap='wrap'>
            <TaskCardLabel
               icon={<PiFlagBanner size={18} />}
               text={t('label-progress')}
            />

            <Menu isLazy isOpen={tagSelect.isOpen} onClose={tagSelect.onClose}>
               <MenuButton
                  flexGrow={1}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={tagSelect.onOpen}
               >
                  <Flex
                     w='full'
                     p={1}
                     borderRadius='md'
                     bg={hovered || tagSelect.isOpen ? 'bg.canvas' : undefined}
                  >
                     <Tag
                        bg={task.progress.color}
                        color={task.progress.titleColor}
                     >
                        {task.progress.title}
                     </Tag>
                  </Flex>
               </MenuButton>

               <MenuList w='488px'>{progressMenuItems}</MenuList>
            </Menu>
         </Flex>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================


ProgressSelect.displayName = 'ProgressSelect'

// PropTypes validation
ProgressSelect.propTypes = {
}

// =============================================================================
// EXPORT
// =============================================================================

export default ProgressSelect
