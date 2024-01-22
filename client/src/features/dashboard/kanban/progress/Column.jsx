import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { createTask } from '../../../../actions/task'

import { Droppable } from 'react-beautiful-dnd'
import { Button, Card, Flex } from '@chakra-ui/react'
import { PiPlus } from 'react-icons/pi'
import TaskCard from '../task/TaskCard'
import NewTaskCard from '../task/NewTaskCard'

import t from '../../../../lang/i18n'

const Column = ({
   droppableId,
   taskPointer,
   progress,
   tasks,
   newTaskInfo,
   createTask
}) => {
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
                  {tasks?.map((task, i_task) =>
                     task.title !== '' ? (
                        <TaskCard
                           key={taskPointer + i_task} //has to match draggableId
                           page_id={newTaskInfo.page_id}
                           task={task}
                           draggableId={(taskPointer + i_task).toString()}
                           index={i_task}
                        />
                     ) : (
                        <NewTaskCard
                           key={taskPointer + i_task} //has to match draggableId
                           page_id={newTaskInfo.page_id}
                           task_id={task._id}
                           draggableId={(taskPointer + i_task).toString()}
                           index={i_task}
                        />
                     )
                  )}
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
   createTask: PropTypes.func.isRequired
}
export default connect(null, { createTask })(Column)
