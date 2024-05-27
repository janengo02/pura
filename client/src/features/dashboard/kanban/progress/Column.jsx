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
   state,
   // Redux props
   page: { page },
   createTask
}) => {
   const newTaskInfo = {
      page_id: page._id,
      group_id: group._id,
      progress_id: progress._id
   }
   const groupIndex = page.group_order.findIndex((g) => g._id === group._id)
   const progressIndex = page.progress_order.findIndex(
      (p) => p._id === progress._id
   )
   const taskMapIndex = groupIndex * page.progress_order.length + progressIndex
   var taskArray = []
   if (taskMapIndex === 0) {
      taskArray = state?.tasks.slice(0, state.task_map[0])
   } else {
      taskArray = state?.tasks.slice(
         state?.task_map[taskMapIndex - 1],
         state?.task_map[taskMapIndex]
      )
   }
   const droppableId = taskMapIndex.toString()
   const taskPointer = state?.task_map[taskMapIndex] - taskArray?.length

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
                           createTask(newTaskInfo)
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
   page: PropTypes.object.isRequired,
   createTask: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
   page: state.page
})
export default connect(mapStateToProps, { createTask })(Column)
