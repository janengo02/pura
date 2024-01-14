import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getFirstPage } from '../../actions/page'
import { moveTask } from '../../actions/page'
import { createGroup } from '../../actions/group'

import { DragDropContext } from 'react-beautiful-dnd'
import {
   Button,
   Flex,
   IconButton,
   Skeleton,
   Text,
   VStack
} from '@chakra-ui/react'

import t from '../../lang/i18n'

import Toolbar from './kanban/toolbar/Toolbar'
import Group from './kanban/group/Group'
import ProgressHeader from './kanban/progress/ProgressHeader'
import FormAlert from '../../components/errorHandler/FormAlert'

import { PiPlus, PiPlusBold } from 'react-icons/pi'
import NewGroup from './kanban/group/NewGroup'

const Kanban = ({
   getFirstPage,
   moveTask,
   createGroup,
   page: { page, loading, error }
}) => {
   const [state, setState] = useState()
   const navigate = useNavigate()

   useEffect(() => {
      setState(page)
   }, [page])

   useEffect(() => {
      getFirstPage()
   }, [getFirstPage, error])

   useEffect(() => {
      if (page && page._id && error) {
         var code = 400
         var msg = 'alert-bad-request'
         if (page.errors && page.errors[0].code) {
            code = page.errors[0].code
            msg = page.errors[0].msg
         }
         const errorState = {
            code: `${code}`,
            msg: `${msg}`
         }
         navigate('/error', { state: errorState })
      }
   }, [error, navigate, page])

   const onDragEnd = (result) => {
      const { destination, source, draggableId } = result
      if (!destination) {
         return
      }
      if (
         destination.droppableId === source.droppableId &&
         destination.index === source.index
      ) {
         return
      }
      const formData = {
         page_id: page._id,
         destination: destination,
         source: source,
         draggableId: draggableId
      }
      // update backend
      moveTask(formData)

      // update front end simultaneously
      const startSpace = +source.droppableId
      const endSpace = +destination.droppableId
      const oldTaskId = +draggableId
      const targetTask = state.tasks[oldTaskId]
      var newTaskId = destination.index
      if (endSpace !== 0) {
         newTaskId += state.task_map[endSpace - 1]
      }
      if (endSpace > startSpace) {
         newTaskId--
      }
      const newTaskArray = Array.from(state.tasks)
      const newTaskMap = Array.from(state.task_map)
      newTaskArray.splice(oldTaskId, 1)
      newTaskArray.splice(newTaskId, 0, targetTask)

      // Moving between different columns
      if (endSpace < startSpace) {
         for (let i = endSpace; i < startSpace; i++) {
            newTaskMap[i]++
         }
      } else {
         for (let i = startSpace; i < endSpace; i++) {
            newTaskMap[i]--
         }
      }
      const newState = {
         ...state,
         task_map: newTaskMap,
         tasks: newTaskArray
      }
      setState(newState)
   }

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
                  paddingBottom={10}
               >
                  {page && (
                     <VStack
                        w='fit-content'
                        h='fit-content'
                        alignItems='flex-start'
                        gap={3}
                     >
                        <Toolbar />
                        <DragDropContext onDragEnd={onDragEnd}>
                           <VStack
                              w='fit-content'
                              h='fit-content'
                              alignItems='flex-start'
                              gap={3}
                           >
                              <Flex gap={3} paddingX={3} alignItems='center'>
                                 {state?.progress_order?.map((progress) => {
                                    return (
                                       <ProgressHeader
                                          key={progress._id}
                                          progress={progress}
                                       />
                                    )
                                 })}
                                 <IconButton
                                    aria-label='Options'
                                    icon={<PiPlusBold />}
                                    variant='ghost'
                                    colorScheme='gray'
                                    color='gray.500'
                                    size='sm'
                                 />
                              </Flex>
                              {state?.group_order?.map((group, i_group) =>
                                 group.title !== '' ? (
                                    <Group
                                       key={group._id}
                                       group={group}
                                       i_group={i_group}
                                       state={state}
                                    />
                                 ) : (
                                    <NewGroup
                                       key={group._id}
                                       group={group}
                                       i_group={i_group}
                                       state={state}
                                    />
                                 )
                              )}
                              <Button
                                 size='sm'
                                 colorScheme='gray'
                                 color='gray.500'
                                 variant='ghost'
                                 leftIcon={<PiPlus />}
                                 onClick={async (e) => {
                                    e.preventDefault()
                                    createGroup({ page_id: state._id })
                                 }}
                              >
                                 {t('btn-add_group')}
                              </Button>
                           </VStack>
                        </DragDropContext>
                     </VStack>
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
   page: PropTypes.object.isRequired,
   moveTask: PropTypes.func.isRequired,
   createGroup: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
   page: state.page
})

export default connect(mapStateToProps, {
   getFirstPage,
   moveTask,
   createGroup
})(Kanban)
