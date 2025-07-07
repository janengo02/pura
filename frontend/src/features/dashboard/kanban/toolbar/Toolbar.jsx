// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import { createTaskModalAction } from '../../../../actions/taskActions'

// UI Components
import { Flex, Spacer, Button } from '@chakra-ui/react'

// Icons
import { PiPlusCircleFill } from 'react-icons/pi'

// Internal Components
import Settings from './Settings'
import Filter from './Filter'

// Utils
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Toolbar = React.memo(
   ({
      // Redux props
      createTaskModalAction,
      pageData: { _id, group_order, progress_order }
   }) => {
      const { t } = useReactiveTranslation()
      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      const newTaskInfo = useMemo(
         () => ({
            page_id: _id,
            group_id: group_order[0]?._id || null,
            progress_id: progress_order[0]?._id || null
         }),
         [_id, group_order, progress_order]
      )

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleCreateTaskModal = useCallback(
         async (e) => {
            e.preventDefault()
            if (group_order.length > 0 && progress_order.length > 0) {
               await createTaskModalAction(newTaskInfo)
            }
         },
         [createTaskModalAction, newTaskInfo, group_order, progress_order]
      )

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      return (
         <Flex
            w='full'
            maxW={802}
            paddingY={5}
            paddingX={3}
            alignItems='center'
         >
            {/* Left Section - Controls */}
            <Flex gap={2} alignItems='center'>
               <Filter />
            </Flex>

            <Spacer w={5} />

            {/* Right Section - Actions */}
            <Flex gap={5} alignItems='center'>
               <Settings />
               <Button
                  size='sm'
                  colorScheme='purple'
                  leftIcon={<PiPlusCircleFill />}
                  onClick={handleCreateTaskModal}
               >
                  {t('btn-new')}
               </Button>
            </Flex>
         </Flex>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
Toolbar.displayName = 'Toolbar'

// PropTypes validation
Toolbar.propTypes = {
   createTaskModalAction: PropTypes.func.isRequired,
   pageData: PropTypes.shape({
      _id: PropTypes.string,
      group_order: PropTypes.array.isRequired,
      progress_order: PropTypes.array.isRequired
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
      (state) => state.page.progress_order
   ],
   (_id, group_order, progress_order) => ({
      _id,
      group_order,
      progress_order
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   pageData: selectPageData(state)
})

const mapDispatchToProps = {
   createTaskModalAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar)
