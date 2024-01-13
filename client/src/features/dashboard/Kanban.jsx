import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getFirstPage } from '../../actions/page'

import { DragDropContext } from 'react-beautiful-dnd'
import { Button, Flex, Skeleton, Text, VStack } from '@chakra-ui/react'

import t from '../../lang/i18n'

import Toolbar from './toolbar/Toolbar'
import Column from './kanban/Column'
import ProgressHeader from './kanban/ProgressHeader'
import GroupTitle from '../../components/typography/GroupTitle'
import FormAlert from '../../components/errorHandler/FormAlert'

import { PiPlus } from 'react-icons/pi'

// import { page } from './kanban/data'

const Kanban = ({ getFirstPage, page: { page, loading, error } }) => {
   const navigate = useNavigate()
   useEffect(() => {
      getFirstPage()
   }, [getFirstPage, error])

   useEffect(() => {
      if (error) {
         var code = 400
         var msg = 'alert-bad-request'
         if (page.errors[0].code) {
            code = page.errors[0].code
            msg = page.errors[0].msg
         }
         const state = {
            code: `${code}`,
            msg: `${msg}`
         }
         navigate('/error', { state: state })
      }
   }, [error, navigate, page])

   // const onDragEnd = (result) => {
   //    const { destination, source, draggableId } = result
   //    if (!destination) {
   //       return
   //    }
   //    if (
   //       destination.droppableId === source.droppableId &&
   //       destination.index === source.index
   //    ) {
   //       return
   //    }
   //    const startSpace = +source.droppableId
   //    const endSpace = +destination.droppableId

   //    const oldTaskId = +draggableId
   //    const targetTask = state.tasks[oldTaskId]
   //    var newTaskId = destination.index
   //    if (endSpace !== 0) {
   //       newTaskId += state.task_map[endSpace - 1]
   //    }
   //    if (endSpace > startSpace) {
   //       newTaskId--
   //    }

   //    const newTaskArray = Array.from(state.tasks)
   //    const newTaskMap = Array.from(state.task_map)

   //    newTaskArray.splice(oldTaskId, 1)
   //    newTaskArray.splice(newTaskId, 0, targetTask)
   //    // Moving within the same column
   //    if (startSpace === endSpace) {
   //       const newState = {
   //          ...state,
   //          tasks: newTaskArray
   //       }
   //       setState(newState)
   //       return
   //    }
   //    // Moving between different columns
   //    if (endSpace < startSpace) {
   //       for (let i = endSpace; i < startSpace; i++) {
   //          newTaskMap[i]++
   //       }
   //    } else {
   //       for (let i = startSpace; i < endSpace; i++) {
   //          newTaskMap[i]--
   //       }
   //    }
   //    const newState = {
   //       ...state,
   //       task_map: newTaskMap,
   //       tasks: newTaskArray
   //    }
   //    setState(newState)
   // }
   return (
      <>
         {error ? (
            <></>
         ) : (
            <Skeleton isLoaded={!loading}>
               <FormAlert />
               <VStack
                  w='fit-content'
                  h='fit-content'
                  minH='full'
                  minW='full'
                  alignItems='center'
                  gap={0}
               >
                  {page && (
                     <>
                        <Toolbar />
                        <DragDropContext
                        // onDragStart={}
                        // onDragUpdate={}
                        // onDragEnd={onDragEnd}
                        >
                           <VStack
                              flexDirection='column'
                              w='fit-content'
                              h='fit-content'
                              minH='full'
                              minW='full'
                              alignItems='center'
                              gap={3}
                           >
                              <Flex gap={3} paddingX={3}>
                                 {page.progress_order.map((progress) => {
                                    return (
                                       <ProgressHeader
                                          key={progress._id}
                                          progress={progress}
                                       />
                                    )
                                 })}
                              </Flex>
                              {page.group_order.map((group, i_group) => {
                                 return (
                                    <VStack
                                       key={group._id}
                                       p={3}
                                       borderWidth={2}
                                       borderColor={group.color}
                                       borderRadius={8}
                                       alignItems='flex-start'
                                    >
                                       <GroupTitle color={group.color}>
                                          {group.title}
                                       </GroupTitle>
                                       <Flex gap={3}>
                                          {page.progress_order?.map(
                                             (progress, i_progress) => {
                                                const i_task_map =
                                                   i_group *
                                                      page.progress_order
                                                         .length +
                                                   i_progress
                                                var taskArray = []
                                                if (i_task_map === 0) {
                                                   taskArray = page.tasks.slice(
                                                      0,
                                                      page.task_map[0]
                                                   )
                                                } else {
                                                   taskArray = page.tasks.slice(
                                                      page.task_map[
                                                         i_task_map - 1
                                                      ],
                                                      page.task_map[i_task_map]
                                                   )
                                                }
                                                const newTaskInfo = {
                                                   page_id: page._id,
                                                   group_id: group._id,
                                                   progress_id: progress._id
                                                }
                                                return (
                                                   <Column
                                                      key={i_task_map} //has to match droppableId
                                                      droppableId={i_task_map.toString()}
                                                      taskPointer={
                                                         page.task_map[
                                                            i_task_map
                                                         ] - taskArray.length
                                                      }
                                                      progress={progress}
                                                      tasks={taskArray}
                                                      newTaskInfo={newTaskInfo}
                                                   />
                                                )
                                             }
                                          )}
                                       </Flex>
                                    </VStack>
                                 )
                              })}
                           </VStack>
                        </DragDropContext>
                     </>
                  )}
                  {!page && (
                     <Text color='gray.500'>
                        {t('guide-no_page')}
                        <Button
                           size='sm'
                           colorScheme='gray'
                           opacity={0.3}
                           variant='ghost'
                           leftIcon={<PiPlus />}
                        >
                           {t('btn-new_page')}
                        </Button>
                     </Text>
                  )}
               </VStack>
            </Skeleton>
         )}
      </>
   )
}

Kanban.propTypes = {
   getFirstPage: PropTypes.func.isRequired,
   page: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
   page: state.page
})

export default connect(mapStateToProps, { getFirstPage })(Kanban)
