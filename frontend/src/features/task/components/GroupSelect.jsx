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
import { PiCirclesFour } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../shared/hooks/useReactiveTranslation'

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectGroupSelectData = createSelector(
   [
      (state) => state.taskSlice.task,
      (state) => state.pageSlice.id,
      (state) => state.pageSlice.groupOrder
   ],
   (task, id, groupOrder) => ({
      task,
      id,
      groupOrder
   })
)

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const GroupSelect = React.memo(() => {
   // -------------------------------------------------------------------------
   // HOOKS & STATE
   // -------------------------------------------------------------------------
   const { t } = useReactiveTranslation()

   // Redux state
   const { task, id, groupOrder } = useSelector(selectGroupSelectData)

   // RTK Query hooks
   const [moveTaskMutation] = useMoveTaskMutation()

   const [hovered, setHovered] = useState(false)
   const tagSelect = useDisclosure()



   // -------------------------------------------------------------------------
   // MEMOIZED VALUES
   // -------------------------------------------------------------------------

      // Memoize group menu items to prevent unnecessary re-renders
      const groupMenuItems = useMemo(() => {
         return (
            groupOrder?.map((group_item) => (
               <MenuItem
                  key={group_item.id}
                  onClick={async (e) => {
                     e.preventDefault()
                     if (group_item.id !== task.group.id) {
                        moveTaskMutation({
                           pageId: id,
                           taskId: task.id,
                           group: group_item,
                           groupId: group_item.id
                        })
                     }
                  }}
               >
                  <Tag
                     borderColor='border.default'
                     borderWidth={1}
                     bg='bg.overlay'
                     color={group_item.color}
                  >
                     {group_item.title}
                  </Tag>
               </MenuItem>
            )) || []
         )
      }, [groupOrder, task.group.id, task.id, id, moveTaskMutation])

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
               icon={<PiCirclesFour size={18} />}
               text={t('label-group')}
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
                        borderColor='border.default'
                        borderWidth={1}
                        bg='bg.surface'
                        color={task.group.color}
                     >
                        {task.group.title}
                     </Tag>
                  </Flex>
               </MenuButton>

               <MenuList w='488px'>{groupMenuItems}</MenuList>
            </Menu>
         </Flex>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================


GroupSelect.displayName = 'GroupSelect'

// PropTypes validation
GroupSelect.propTypes = {
}


// =============================================================================
// EXPORT
// =============================================================================

export default GroupSelect
