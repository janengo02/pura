// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'

// Actions
import {
   deleteGroupAction,
   updateGroupAction
} from '../../../../actions/groupActions'

// UI Components
import {
   Flex,
   IconButton,
   Menu,
   MenuButton,
   MenuDivider,
   MenuItem,
   MenuItemOption,
   MenuList,
   MenuOptionGroup,
   VStack,
   useColorMode,
   useDisclosure
} from '@chakra-ui/react'

// Internal Components
import GroupTitle from '../../../../components/typography/GroupTitle'
import { MultiInput } from '../../../../components/MultiInput'

// External Libraries
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// Utils & Icons
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'
import {
   PiCircleFill,
   PiDotsThreeBold,
   PiPencilLine,
   PiTrash
} from 'react-icons/pi'

// Schema & Data
import { dashboardSchema as s } from '../../DashboardSchema'
import { groupColors } from '../../../../components/data/defaultColor'

// Custom Hooks
import { useHover } from '../../../../hooks/useHover'
import { useEditing } from '../../../../hooks/useEditing'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Group = React.memo(
   ({
      group,
      isNew = false,
      children = null,
      // Redux props
      _id,
      group_order,
      updateGroupAction,
      deleteGroupAction
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()
      const { colorMode } = useColorMode()

      const groupHover = useHover()
      const titleEditing = useEditing()
      const dropdownMenu = useDisclosure()

      const methods = useForm({
         resolver: yupResolver(s),
         defaultValues: {
            title: isNew ? '' : group.title
         }
      })
      // -------------------------------------------------------------------------
      // EFFECTS
      // -------------------------------------------------------------------------

      // Reset form whenever task.title changes or editing state changes
      useEffect(() => {
         if (titleEditing.isEditing || isNew) {
            const currentTitle = isNew ? '' : group.title
            methods.reset({
               title: currentTitle
            })
         }
      }, [group.title, titleEditing.isEditing, isNew, methods])

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleDeleteGroup = useCallback(() => {
         const formData = {
            page_id: _id,
            group_id: group._id
         }
         deleteGroupAction(formData)
      }, [_id, group._id, deleteGroupAction])

      const handleSubmitTitle = methods.handleSubmit(async (data) => {
         const formData = {
            page_id: _id,
            group_id: group._id,
            title: data.title || t('placeholder-untitled')
         }
         await updateGroupAction(formData)
         titleEditing.end()
      })

      const handleColorChange = useCallback(
         (color) => {
            const formData = {
               page_id: _id,
               group_id: group._id,
               color: color
            }
            updateGroupAction(formData)
         },
         [_id, group._id, updateGroupAction]
      )

      const handleMouseEnter = useCallback(
         (e) => {
            e.preventDefault()
            groupHover.start()
         },
         [groupHover]
      )

      const handleMouseLeave = useCallback(
         (e) => {
            e.preventDefault()
            groupHover.end()
         },
         [groupHover]
      )

      const handleInputBlur = useCallback(
         (e) => {
            e.preventDefault()
            if (!group.isNew) {
               handleSubmitTitle()
            } else {
               e.currentTarget.select()
            }
         },
         [group.isNew, handleSubmitTitle]
      )

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      // Memoize gap calculation for performance
      const containerGap = useMemo(
         () => (titleEditing.isEditing || isNew ? 0 : 2),
         [titleEditing.isEditing, isNew]
      )

      // Memoize menu button opacity
      const menuButtonOpacity = useMemo(
         () => (groupHover.isHovered || dropdownMenu.isOpen ? 1 : 0),
         [groupHover.isHovered, dropdownMenu.isOpen]
      )

      // Memoize color options rendering
      const colorOptions = useMemo(
         () =>
            groupColors.map((colorOption) => (
               <MenuItemOption
                  key={colorOption.color}
                  value={colorOption.color}
                  onClick={() => handleColorChange(colorOption.color)}
               >
                  <Flex alignItems='center' gap={2}>
                     <Flex color={colorOption.color}>
                        <PiCircleFill size={18} />
                     </Flex>
                     {colorOption.title}
                  </Flex>
               </MenuItemOption>
            )),
         [handleColorChange]
      )
      // Memoize delete button visibility
      const showDeleteButton = useMemo(
         () => group_order.length > 1,
         [group_order.length]
      )
      // -------------------------------------------------------------------------
      // RENDER COMPONENTS
      // -------------------------------------------------------------------------

      const renderTitleInput = () => (
         <FormProvider {...methods}>
            <form noValidate autoComplete='on'>
               <MultiInput
                  name='title'
                  type='text'
                  variant='unstyled'
                  placeholder={t('placeholder-untitled')}
                  validation={s.title}
                  color={group.color}
                  fontWeight={600}
                  borderRadius={0}
                  autoFocus
                  onBlur={handleInputBlur}
               />
            </form>
         </FormProvider>
      )

      const renderTitleDisplay = () => (
         <>
            <GroupTitle color={group.color}>{group.title}</GroupTitle>
            <Menu
               isOpen={dropdownMenu.isOpen}
               onClose={dropdownMenu.onClose}
               isLazy
            >
               <MenuButton
                  as={IconButton}
                  icon={<PiDotsThreeBold />}
                  variant='ghost'
                  size='xs'
                  colorScheme={colorMode === 'dark' ? 'white' : 'blackAlpha'}
                  opacity={menuButtonOpacity}
                  onClick={dropdownMenu.onOpen}
               />
               <MenuList>
                  <MenuItem
                     icon={<PiPencilLine size={14} />}
                     fontSize='sm'
                     onClick={titleEditing.start}
                  >
                     {t('btn-edit-name')}
                  </MenuItem>
                  <MenuDivider />
                  <MenuOptionGroup title={t('label-color')} type='radio'>
                     {colorOptions}
                  </MenuOptionGroup>
                  {showDeleteButton && (
                     <>
                        <MenuDivider />
                        <MenuItem
                           icon={<PiTrash size={14} />}
                           fontSize='sm'
                           color='danger.primary'
                           onClick={handleDeleteGroup}
                        >
                           {t('btn-delete')}
                        </MenuItem>
                     </>
                  )}
               </MenuList>
            </Menu>
         </>
      )

      // -------------------------------------------------------------------------
      // MAIN RENDER
      // -------------------------------------------------------------------------

      return (
         <VStack
            p={3}
            paddingTop={2}
            gap={containerGap}
            borderWidth={2}
            borderColor='border.muted'
            borderRadius={8}
            alignItems='flex-start'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
         >
            <Flex w='full' alignItems='center' gap={2}>
               {titleEditing.isEditing || isNew
                  ? renderTitleInput()
                  : renderTitleDisplay()}
            </Flex>
            <Flex gap={3}>{children}</Flex>
         </VStack>
      )
   }
)

// =============================================================================
// PROPTYPES & REDUX CONNECTION
// =============================================================================

Group.propTypes = {
   group: PropTypes.object.isRequired,
   isNew: PropTypes.bool,
   children: PropTypes.node,
   // Redux props
   _id: PropTypes.string.isRequired,
   group_order: PropTypes.array.isRequired,
   updateGroupAction: PropTypes.func.isRequired,
   deleteGroupAction: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
   _id: state.page._id,
   group_order: state.page.group_order
})

const mapDispatchToProps = {
   deleteGroupAction,
   updateGroupAction
}

export default connect(mapStateToProps, mapDispatchToProps)(Group)
