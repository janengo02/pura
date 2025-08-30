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
   ({ moveTaskAction, progressData: { task, id, progressOrder } }) => {
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
            progressOrder?.map((progress_item) => (
               <MenuItem
                  key={progress_item.id}
                  onClick={async (e) => {
                     e.preventDefault()
                     if (progress_item.id !== task.progress.id) {
                        moveTaskAction({
                           pageId: id,
                           taskId: task.id,
                           progress: progress_item
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
      }, [progressOrder, task.progress.id, task.id, id, moveTaskAction])

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

// Display name for debugging
ProgressSelect.displayName = 'ProgressSelect'

// PropTypes validation
ProgressSelect.propTypes = {
   moveTaskAction: PropTypes.func.isRequired,
   progressData: PropTypes.shape({
      task: PropTypes.object.isRequired,
      id: PropTypes.string.isRequired,
      progressOrder: PropTypes.array.isRequired
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectProgressSelectData = createSelector(
   [
      (state) => state.task.task,
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
