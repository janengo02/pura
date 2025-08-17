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
   id,
   groupOrder,
   progressOrder,
   taskMap,
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
         pageId: id,
         groupId: group.id,
         progressId: progress.id
      }),
      [id, group.id, progress.id]
   )

   const taskData = useMemo(() => {
      const groupIndex = groupOrder.findIndex((g) => g.id === group.id)
      const progressIndex = progressOrder.findIndex((p) => p.id === progress.id)
      const taskMapIndex = groupIndex * progressOrder.length + progressIndex

      let taskArray = []
      if (taskMapIndex === 0) {
         taskArray = tasks.slice(0, taskMap[0])
      } else {
         taskArray = tasks.slice(
            taskMap[taskMapIndex - 1],
            taskMap[taskMapIndex]
         )
      }

      const droppableId = taskMapIndex.toString()
      const taskPointer = taskMap[taskMapIndex] - taskArray?.length

      return {
         taskArray,
         droppableId,
         taskPointer
      }
   }, [groupOrder, progressOrder, taskMap, tasks, group.id, progress.id])

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
                     leftIcon={<PiPlus size={18} />}
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
      id: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      isNew: PropTypes.bool
   }).isRequired,
   group: PropTypes.shape({
      id: PropTypes.string.isRequired,
      isNew: PropTypes.bool
   }).isRequired,
   // Redux props
   id: PropTypes.string.isRequired,
   groupOrder: PropTypes.array.isRequired,
   progressOrder: PropTypes.array.isRequired,
   taskMap: PropTypes.array.isRequired,
   tasks: PropTypes.array.isRequired,
   createTaskAction: PropTypes.func.isRequired
}

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   id: state.page.id,
   groupOrder: state.page.groupOrder,
   progressOrder: state.page.progressOrder,
   taskMap: state.page.taskMap,
   tasks: state.page.tasks
})

const mapDispatchToProps = {
   createTaskAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Column)
