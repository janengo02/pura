// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'

// Actions
import { createTaskAction } from '../../../../actions/taskActions'

// External Libraries
import { Droppable } from '@hello-pangea/dnd'

// UI Components
import { Button, Card, Flex, useColorMode } from '@chakra-ui/react'

// Internal Components
import TaskCard from '../task/TaskCard'

// Utils & Icons
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'
import { PiPlus } from 'react-icons/pi'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Column = ({
   progress,
   group,
   // Redux props
   _id,
   group_order,
   progress_order,
   task_map,
   tasks,
   createTaskAction
}) => {
   // -------------------------------------------------------------------------
   // HOOKS & STATE
   // -------------------------------------------------------------------------

   const { t } = useReactiveTranslation()
   const { colorMode } = useColorMode()

   // -------------------------------------------------------------------------
   // MEMOIZED VALUES
   // -------------------------------------------------------------------------

   const newTaskInfo = useMemo(
      () => ({
         page_id: _id,
         group_id: group._id,
         progress_id: progress._id
      }),
      [_id, group._id, progress._id]
   )

   const taskData = useMemo(() => {
      const groupIndex = group_order.findIndex((g) => g._id === group._id)
      const progressIndex = progress_order.findIndex(
         (p) => p._id === progress._id
      )
      const taskMapIndex = groupIndex * progress_order.length + progressIndex

      let taskArray = []
      if (taskMapIndex === 0) {
         taskArray = tasks.slice(0, task_map[0])
      } else {
         taskArray = tasks.slice(
            task_map[taskMapIndex - 1],
            task_map[taskMapIndex]
         )
      }

      const droppableId = taskMapIndex.toString()
      const taskPointer = task_map[taskMapIndex] - taskArray?.length

      return {
         taskArray,
         droppableId,
         taskPointer
      }
   }, [group_order, progress_order, task_map, tasks, group._id, progress._id])

   const taskCards = useMemo(
      () =>
         taskData.taskArray?.map((task, taskIndex) => (
            <TaskCard
               key={taskData.taskPointer + taskIndex} // Must match draggableId
               task={task}
               isNew={task.title === ''}
               draggableId={(taskData.taskPointer + taskIndex).toString()}
               taskIndex={taskIndex}
               progressColor={progress.color}
            />
         )) || [],
      [taskData.taskArray, taskData.taskPointer, progress.color]
   )

   // -------------------------------------------------------------------------
   // EVENT HANDLERS
   // -------------------------------------------------------------------------

   const handleCreateTask = useCallback(
      async (e) => {
         e.preventDefault()
         if (!progress.isNew && !group.isNew) {
            createTaskAction(newTaskInfo)
         }
      },
      [progress.isNew, group.isNew, createTaskAction, newTaskInfo]
   )

   // -------------------------------------------------------------------------
   // RENDER COMPONENTS
   // -------------------------------------------------------------------------

   // Render droppable content
   const renderDroppableContent = useCallback(
      (provided, snapshot) => (
         <Card
            variant='filled'
            bg={progress.color}
            p={2}
            w={250}
            minH='48px'
            gap={2}
            boxShadow={snapshot.isDraggingOver ? 'outline' : undefined}
         >
            <Flex
               ref={provided.innerRef}
               {...provided.droppableProps}
               flexDirection='column'
               flexGrow={1}
            >
               {taskCards}
               {provided.placeholder}
               {newTaskInfo && (
                  <Button
                     size='sm'
                     variant='ghost'
                     colorScheme={colorMode === 'dark' ? 'white' : 'blackAlpha'}
                     color='text.muted'
                     justifyContent='flex-start'
                     leftIcon={<PiPlus />}
                     onClick={handleCreateTask}
                  >
                     {t('btn-new')}
                  </Button>
               )}
            </Flex>
         </Card>
      ),
      [progress.color, taskCards, newTaskInfo, handleCreateTask, t, colorMode]
   )

   // -------------------------------------------------------------------------
   // MAIN RENDER
   // -------------------------------------------------------------------------

   return (
      <Droppable droppableId={taskData.droppableId}>
         {renderDroppableContent}
      </Droppable>
   )
}

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
Column.displayName = 'Column'

// PropTypes validation
Column.propTypes = {
   progress: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      isNew: PropTypes.bool
   }).isRequired,
   group: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      isNew: PropTypes.bool
   }).isRequired,
   // Redux props
   _id: PropTypes.string.isRequired,
   group_order: PropTypes.array.isRequired,
   progress_order: PropTypes.array.isRequired,
   task_map: PropTypes.array.isRequired,
   tasks: PropTypes.array.isRequired,
   createTaskAction: PropTypes.func.isRequired
}

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   _id: state.page._id,
   group_order: state.page.group_order,
   progress_order: state.page.progress_order,
   task_map: state.page.task_map,
   tasks: state.page.tasks
})

const mapDispatchToProps = {
   createTaskAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Column)
