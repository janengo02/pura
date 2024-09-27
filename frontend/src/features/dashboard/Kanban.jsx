import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getFirstPage, moveTask } from '../../actions/pageActions'
import { createGroup } from '../../actions/groupActions'
import { createProgress } from '../../actions/progressActions'
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
import Column from './kanban/progress/Column'

const Kanban = ({
   // Redux props
   getFirstPage,
   moveTask,
   createGroup,
   createProgress,

   _id,
   group_order,
   progress_order,
   errors,
   error,
   loading
}) => {
   const navigate = useNavigate()

   useEffect(() => {
      getFirstPage()
   }, [getFirstPage, error])

   useEffect(() => {
      if (_id && error) {
         var code = 400
         var msg = 'alert-bad-request'
         if (errors && errors[0].code) {
            code = errors[0].code
            msg = errors[0].msg
         }
         const errorState = {
            code: `${code}`,
            msg: `${msg}`
         }
         navigate('/error', { state: errorState })
      }
   }, [error, navigate, _id, errors])

   const onDragEnd = (result) => {
      const reqData = {
         page_id: _id,
         result: result
      }

      moveTask(reqData)
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
                  {_id && (
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
                                 {progress_order?.map((progress) => (
                                    <ProgressHeader
                                       key={progress._id}
                                       progress={progress}
                                       isNew={progress.title === ''}
                                    />
                                 ))}
                                 <IconButton
                                    aria-label='Options'
                                    icon={<PiPlusBold />}
                                    variant='ghost'
                                    colorScheme='gray'
                                    color='gray.500'
                                    size='sm'
                                    onClick={async (e) => {
                                       e.preventDefault()
                                       createProgress({ page_id: _id })
                                    }}
                                 />
                              </Flex>
                              {group_order?.map((group) => (
                                 <Group
                                    key={group._id}
                                    group={group}
                                    isNew={group.title === ''}
                                 >
                                    {progress_order?.map((progress) => (
                                       <Column
                                          key={progress._id} //has to match droppableId
                                          progress={progress}
                                          group={group}
                                       />
                                    ))}
                                 </Group>
                              ))}
                              <Button
                                 size='sm'
                                 colorScheme='gray'
                                 color='gray.500'
                                 variant='ghost'
                                 leftIcon={<PiPlus />}
                                 onClick={async (e) => {
                                    e.preventDefault()
                                    createGroup({ page_id: _id })
                                 }}
                              >
                                 {t('btn-add-group')}
                              </Button>
                           </VStack>
                        </DragDropContext>
                     </VStack>
                  )}
                  {!_id && (
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
   moveTask: PropTypes.func.isRequired,
   createGroup: PropTypes.func.isRequired,
   createProgress: PropTypes.func.isRequired,

   _id: PropTypes.string,
   group_order: PropTypes.array.isRequired,
   progress_order: PropTypes.array.isRequired,
   loading: PropTypes.bool.isRequired,
   errors: PropTypes.array,
   error: PropTypes.bool
}

const mapStateToProps = (state) => ({
   _id: state.page._id,
   group_order: state.page.group_order,
   progress_order: state.page.progress_order,
   loading: state.page.loading,
   errors: state.page.errors,
   error: state.page.error
})

export default connect(mapStateToProps, {
   getFirstPage,
   moveTask,
   createGroup,
   createProgress
})(Kanban)
