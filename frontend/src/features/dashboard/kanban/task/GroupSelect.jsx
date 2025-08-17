// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import { moveTaskAction } from '../../../../actions/taskActions'

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
import TaskCardLabel from '../../../../components/typography/TaskCardLabel'

// Utils & Icons
import { PiCirclesFour } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const GroupSelect = React.memo(
   ({ moveTaskAction, groupData: { task, id, groupOrder } }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()

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
                        moveTaskAction({
                           pageId: id,
                           taskId: task.id,
                           group: group_item
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
      }, [groupOrder, task.group.id, task.id, id, moveTaskAction])

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

      return (
         <Flex w='full' gap={3}>
            <TaskCardLabel
               icon={<PiCirclesFour size={18} />}
               text={t('label-group')}
            />

            <Menu isLazy isOpen={tagSelect.isOpen} onClose={tagSelect.onClose}>
               <MenuButton
                  w='full'
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

// Display name for debugging
GroupSelect.displayName = 'GroupSelect'

// PropTypes validation
GroupSelect.propTypes = {
   moveTaskAction: PropTypes.func.isRequired,
   groupData: PropTypes.shape({
      task: PropTypes.object.isRequired,
      id: PropTypes.string.isRequired,
      groupOrder: PropTypes.array.isRequired
   }).isRequired
}
// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectGroupSelectData = createSelector(
   [
      (state) => state.task.task,
      (state) => state.page.id,
      (state) => state.page.groupOrder
   ],
   (task, id, groupOrder) => ({
      task,
      id,
      groupOrder
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   groupData: selectGroupSelectData(state)
})

const mapDispatchToProps = {
   moveTaskAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(GroupSelect)
