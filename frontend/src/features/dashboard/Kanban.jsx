// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import { dropTaskAction } from '../../actions/pageActions'
import { createGroupAction } from '../../actions/groupActions'
import { createProgressAction } from '../../actions/progressActions'

// RTK Query
import { useGetFirstPageQuery } from '../../api/pageApi'

// External Libraries
import { DragDropContext } from '@hello-pangea/dnd'

// UI Components
import {
   Button,
   Flex,
   IconButton,
   Skeleton,
   Text,
   VStack
} from '@chakra-ui/react'

// Internal Components
import Toolbar from './kanban/toolbar/Toolbar'
import Group from './kanban/group/Group'
import ProgressHeader from './kanban/progress/ProgressHeader'
import Column from './kanban/progress/Column'

// Utils & Icons
import { PiPlus, PiPlusBold } from 'react-icons/pi'

// Hooks
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Kanban = React.memo(
   ({
      // Redux props
      dropTaskAction,
      createGroupAction,
      createProgressAction,
      pageData: { id, groupOrder, progressOrder }
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()

      const navigate = useNavigate()

      // RTK Query hook to trigger initial data fetch (but use Redux state for data access)
      const { error, isLoading } = useGetFirstPageQuery()

      // -------------------------------------------------------------------------
      // UTIL COMPONENTS
      // -------------------------------------------------------------------------
      const progressHeaders = useMemo(
         () =>
            progressOrder?.map((progress) => (
               <ProgressHeader
                  key={progress.id}
                  progress={progress}
                  isNew={progress.title === ''}
               />
            )) || [],
         [progressOrder]
      )

      const groupComponents = useMemo(
         () =>
            groupOrder?.map((group) => (
               <Group key={group.id} group={group} isNew={group.title === ''}>
                  {progressOrder?.map((progress) => (
                     <Column
                        key={`${group.id}-${progress.id}`} // More specific key
                        progress={progress}
                        group={group}
                     />
                  ))}
               </Group>
            )) || [],
         [groupOrder, progressOrder]
      )

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const onDragEnd = useCallback(
         (result) => {
            const reqData = {
               pageId: id,
               result: result
            }
            dropTaskAction(reqData)
         },
         [id, dropTaskAction]
      )

      const handleCreateProgress = useCallback(
         async (e) => {
            e.preventDefault()
            createProgressAction({ pageId: id })
         },
         [id, createProgressAction]
      )

      const handleCreateGroup = useCallback(
         async (e) => {
            e.preventDefault()
            createGroupAction({ pageId: id })
         },
         [id, createGroupAction]
      )

      // -------------------------------------------------------------------------
      // EFFECTS
      // -------------------------------------------------------------------------


      useEffect(() => {
         if (error) {
            const errorState = {
                  code: error.status || 400,
                  msg: error.data?.message || error.message || 'alert-bad-request'
               }
            navigate('/error', { state: errorState })
         }
      }, [error, navigate])

      // -------------------------------------------------------------------------
      // RENDER LOGIC
      // -------------------------------------------------------------------------

      if (error && !id) {
         return <></>
      }

      return (
         <Skeleton isLoaded={!isLoading}>
            <VStack
               w='fit-content'
               h='fit-content'
               minH='full'
               minW='full'
               alignItems='center'
               gap={0}
               paddingBottom={10}
            >
               {id ? (
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
                              {progressHeaders}
                              <IconButton
                                 aria-label={t('aria-options')}
                                 icon={<PiPlusBold size={18} />}
                                 variant='ghost'
                                 colorScheme='gray'
                                 color='text.secondary'
                                 size='md'
                                 onClick={handleCreateProgress}
                              />
                           </Flex>
                           {groupComponents}
                           <Button
                              size='md'
                              colorScheme='gray'
                              color='text.secondary'
                              variant='ghost'
                              leftIcon={<PiPlus size={18} />}
                              onClick={handleCreateGroup}
                           >
                              {t('btn-add-group')}
                           </Button>
                        </VStack>
                     </DragDropContext>
                  </VStack>
               ) : (
                  <Text color='text.secondary'>
                     {t('guide-no_page')}
                     <Button
                        size='md'
                        colorScheme='gray'
                        opacity={0.3}
                        variant='ghost'
                        leftIcon={<PiPlus size={18} />}
                     >
                        {t('btn-new_page')}
                     </Button>
                  </Text>
               )}
            </VStack>
         </Skeleton>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
Kanban.displayName = 'Kanban'

// PropTypes validation
Kanban.propTypes = {
   dropTaskAction: PropTypes.func.isRequired,
   createGroupAction: PropTypes.func.isRequired,
   createProgressAction: PropTypes.func.isRequired,
   pageData: PropTypes.shape({
      id: PropTypes.string,
      groupOrder: PropTypes.array.isRequired,
      progressOrder: PropTypes.array.isRequired
   }).isRequired
}
// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectPageData = createSelector(
   [(state) => state.pageSlice],
   (pageSlice) => ({
      id: pageSlice.id,
      groupOrder: pageSlice.groupOrder,
      progressOrder: pageSlice.progressOrder
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   pageData: selectPageData(state)
})

const mapDispatchToProps = {
   dropTaskAction,
   createGroupAction,
   createProgressAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Kanban)
