import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { createTask } from '../../../../actions/task'

import { Droppable } from 'react-beautiful-dnd'
import { Button, Card, Flex } from '@chakra-ui/react'
import { PiPlus } from 'react-icons/pi'
import TaskCard from '../task/TaskCard'

import t from '../../../../lang/i18n'

const Column = ({
   progress,
   group,
   // Redux props
   _id,
   group_order,
   progress_order,
   task_map,
   tasks,

   createTask
}) => {
   const newTaskInfo = {
      page_id: _id,
      group_id: group._id,
      progress_id: progress._id
   }
   const groupIndex = group_order.findIndex((g) => g._id === group._id)
   const progressIndex = progress_order.findIndex((p) => p._id === progress._id)

   const taskMapIndex = groupIndex * progress_order.length + progressIndex
   var taskArray = []
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
   return (
      <Droppable droppableId={droppableId}>
         {(provided, snapshot) => (
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
                  {taskArray?.map((task, taskIndex) => (
                     <TaskCard
                        key={taskPointer + taskIndex} //has to match draggableId
                        task={task}
                        isNew={task.title === ''}
                        draggableId={(taskPointer + taskIndex).toString()}
                        taskIndex={taskIndex}
                     />
                  ))}
                  {provided.placeholder}
                  {newTaskInfo && (
                     <Button
                        size='sm'
                        variant='ghost'
                        colorScheme='blackAlpha'
                        color='blackAlpha.400'
                        justifyContent='flex-start'
                        leftIcon={<PiPlus />}
                        onClick={async (e) => {
                           e.preventDefault()
                           if (!progress.isNew && !group.isNew) {
                              createTask(newTaskInfo)
                           }
                        }}
                     >
                        {t('btn-new')}
                     </Button>
                  )}
               </Flex>
            </Card>
         )}
      </Droppable>
   )
}
Column.propTypes = {
   _id: PropTypes.string.isRequired,
   group_order: PropTypes.array.isRequired,
   progress_order: PropTypes.array.isRequired,
   task_map: PropTypes.array.isRequired,
   tasks: PropTypes.array.isRequired,
   createTask: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
   _id: state.page._id,
   group_order: state.page.group_order,
   progress_order: state.page.progress_order,
   task_map: state.page.task_map,
   tasks: state.page.tasks
})
export default connect(mapStateToProps, { createTask })(Column)
