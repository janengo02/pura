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
      pageData: { id, groupOrder, progressOrder }
   }) => {
      const { t } = useReactiveTranslation()
      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      const newTaskInfo = useMemo(
         () => ({
            pageId: id,
            groupId: groupOrder[0]?.id || null,
            progressId: progressOrder[0]?.id || null
         }),
         [id, groupOrder, progressOrder]
      )

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleCreateTaskModal = useCallback(
         async (e) => {
            e.preventDefault()
            if (groupOrder.length > 0 && progressOrder.length > 0) {
               await createTaskModalAction(newTaskInfo)
            }
         },
         [createTaskModalAction, newTaskInfo, groupOrder, progressOrder]
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
                  size='md'
                  colorScheme='purple'
                  leftIcon={<PiPlusCircleFill size={18} />}
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
      id: PropTypes.string,
      groupOrder: PropTypes.array.isRequired,
      progressOrder: PropTypes.array.isRequired
   }).isRequired
}
// =============================================================================
// REDUX SELECTORS
// =============================================================================

// Memoized selectors for better Redux performance
const selectPageData = createSelector(
   [
      (state) => state.page.id,
      (state) => state.page.groupOrder,
      (state) => state.page.progressOrder
   ],
   (id, groupOrder, progressOrder) => ({
      id,
      groupOrder,
      progressOrder
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
