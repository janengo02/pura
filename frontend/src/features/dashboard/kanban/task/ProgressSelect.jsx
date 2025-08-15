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
import { PiFlagBanner } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ProgressSelect = React.memo(
   ({ moveTaskAction, progressData: { task, _id, progress_order } }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()

      const [hovered, setHovered] = useState(false)
      const tagSelect = useDisclosure()

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      // Memoize progress menu items to prevent unnecessary re-renders
      const progressMenuItems = useMemo(() => {
         return (
            progress_order?.map((progress_item) => (
               <MenuItem
                  key={progress_item._id}
                  onClick={async (e) => {
                     e.preventDefault()
                     if (progress_item._id !== task.progress._id) {
                        moveTaskAction({
                           page_id: _id,
                           task_id: task._id,
                           progress: progress_item
                        })
                     }
                  }}
               >
                  <Tag
                     bg={progress_item.color}
                     color={progress_item.title_color}
                  >
                     {progress_item.title}
                  </Tag>
               </MenuItem>
            )) || []
         )
      }, [progress_order, task.progress._id, task._id, _id, moveTaskAction])

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
               icon={<PiFlagBanner size={18} />}
               text={t('label-progress')}
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
                        bg={task.progress.color}
                        color={task.progress.title_color}
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

// Display name for debugging
ProgressSelect.displayName = 'ProgressSelect'

// PropTypes validation
ProgressSelect.propTypes = {
   moveTaskAction: PropTypes.func.isRequired,
   progressData: PropTypes.shape({
      task: PropTypes.object.isRequired,
      _id: PropTypes.string.isRequired,
      progress_order: PropTypes.array.isRequired
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectProgressSelectData = createSelector(
   [
      (state) => state.task.task,
      (state) => state.page._id,
      (state) => state.page.progress_order
   ],
   (task, _id, progress_order) => ({
      task,
      _id,
      progress_order
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   progressData: selectProgressSelectData(state)
})

const mapDispatchToProps = {
   moveTaskAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(ProgressSelect)
