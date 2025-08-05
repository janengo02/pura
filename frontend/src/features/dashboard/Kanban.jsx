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
import { getFirstPageAction, dropTaskAction } from '../../actions/pageActions'
import { createGroupAction } from '../../actions/groupActions'
import { createProgressAction } from '../../actions/progressActions'

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
      getFirstPageAction,
      dropTaskAction,
      createGroupAction,
      createProgressAction,
      pageData: { _id, group_order, progress_order, errors, error, loading }
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()

      const navigate = useNavigate()

      const errorState = useMemo(() => {
         if (!(_id && error)) return null

         const code = errors?.[0]?.code || 400
         const msg = errors?.[0]?.msg || 'alert-bad-request'

         return {
            code: `${code}`,
            msg: `${msg}`
         }
      }, [_id, error, errors])

      // -------------------------------------------------------------------------
      // UTIL COMPONENTS
      // -------------------------------------------------------------------------
      const progressHeaders = useMemo(
         () =>
            progress_order?.map((progress) => (
               <ProgressHeader
                  key={progress._id}
                  progress={progress}
                  isNew={progress.title === ''}
               />
            )) || [],
         [progress_order]
      )

      const groupComponents = useMemo(
         () =>
            group_order?.map((group) => (
               <Group key={group._id} group={group} isNew={group.title === ''}>
                  {progress_order?.map((progress) => (
                     <Column
                        key={`${group._id}-${progress._id}`} // More specific key
                        progress={progress}
                        group={group}
                     />
                  ))}
               </Group>
            )) || [],
         [group_order, progress_order]
      )

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const onDragEnd = useCallback(
         (result) => {
            const reqData = {
               page_id: _id,
               result: result
            }
            dropTaskAction(reqData)
         },
         [_id, dropTaskAction]
      )

      const handleCreateProgress = useCallback(
         async (e) => {
            e.preventDefault()
            createProgressAction({ page_id: _id })
         },
         [_id, createProgressAction]
      )

      const handleCreateGroup = useCallback(
         async (e) => {
            e.preventDefault()
            createGroupAction({ page_id: _id })
         },
         [_id, createGroupAction]
      )

      // -------------------------------------------------------------------------
      // EFFECTS
      // -------------------------------------------------------------------------

      useEffect(() => {
         getFirstPageAction()
      }, [getFirstPageAction])

      useEffect(() => {
         if (errorState) {
            navigate('/error', { state: errorState })
         }
      }, [errorState, navigate])

      // -------------------------------------------------------------------------
      // RENDER LOGIC
      // -------------------------------------------------------------------------

      if (error && !_id) {
         return <></>
      }

      return (
         <Skeleton isLoaded={!loading}>
            <VStack
               w='fit-content'
               h='fit-content'
               minH='full'
               minW='full'
               alignItems='center'
               gap={0}
               paddingBottom={10}
            >
               {_id ? (
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
   getFirstPageAction: PropTypes.func.isRequired,
   dropTaskAction: PropTypes.func.isRequired,
   createGroupAction: PropTypes.func.isRequired,
   createProgressAction: PropTypes.func.isRequired,
   pageData: PropTypes.shape({
      _id: PropTypes.string,
      group_order: PropTypes.array.isRequired,
      progress_order: PropTypes.array.isRequired,
      loading: PropTypes.bool.isRequired,
      errors: PropTypes.array,
      error: PropTypes.bool
   }).isRequired
}
// =============================================================================
// REDUX SELECTORS
// =============================================================================

// Memoized selectors for better Redux performance
const selectPageData = createSelector(
   [
      (state) => state.page._id,
      (state) => state.page.group_order,
      (state) => state.page.progress_order,
      (state) => state.page.loading,
      (state) => state.page.error,
      (state) => state.page.errors
   ],
   (_id, group_order, progress_order, loading, error, errors) => ({
      _id,
      group_order,
      progress_order,
      loading,
      error,
      errors
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   pageData: selectPageData(state)
})

const mapDispatchToProps = {
   getFirstPageAction,
   dropTaskAction,
   createGroupAction,
   createProgressAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Kanban)
