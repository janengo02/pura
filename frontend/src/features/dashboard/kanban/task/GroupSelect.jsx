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
   ({ moveTaskAction, groupData: { task, _id, group_order } }) => {
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
            group_order?.map((group_item) => (
               <MenuItem
                  key={group_item._id}
                  onClick={async (e) => {
                     e.preventDefault()
                     if (group_item._id !== task.group._id) {
                        moveTaskAction({
                           page_id: _id,
                           task_id: task._id,
                           group_id: group_item._id,
                           task_detail_flg: true
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
      }, [group_order, task.group._id, task._id, _id, moveTaskAction])

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
            <TaskCardLabel icon={<PiCirclesFour />} text={t('label-group')} />

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
      _id: PropTypes.string.isRequired,
      group_order: PropTypes.array.isRequired
   }).isRequired
}
// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectGroupSelectData = createSelector(
   [
      (state) => state.task.task,
      (state) => state.page._id,
      (state) => state.page.group_order
   ],
   (task, _id, group_order) => ({
      task,
      _id,
      group_order
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
