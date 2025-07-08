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
   deleteProgressAction,
   updateProgressAction
} from '../../../../actions/progressActions'

// UI Components
import {
   Card,
   Flex,
   IconButton,
   Menu,
   MenuButton,
   MenuDivider,
   MenuItem,
   MenuItemOption,
   MenuList,
   MenuOptionGroup,
   Spacer,
   Text,
   useColorMode,
   useDisclosure
} from '@chakra-ui/react'

// Internal Components
import { MultiInput } from '../../../../components/MultiInput'

// External Libraries
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// Utils & Icons
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'
import {
   PiCircleDuotone,
   PiCircleFill,
   PiDotsThreeBold,
   PiPencilLine,
   PiTrash
} from 'react-icons/pi'

// Schema & Data
import { dashboardSchema as s } from '../../DashboardSchema'
import { progressColors } from '../../../../components/data/defaultColor'

// Custom Hooks
import { useHover } from '../../../../hooks/useHover'
import { useEditing } from '../../../../hooks/useEditing'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ProgressHeader = React.memo(
   ({
      progress,
      isNew = false,
      // Redux props
      _id,
      progress_order,
      updateProgressAction,
      deleteProgressAction
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()
      const { colorMode } = useColorMode()

      const progressHover = useHover()
      const titleEditing = useEditing()
      const dropdownMenu = useDisclosure()

      const methods = useForm({
         resolver: yupResolver(s),
         defaultValues: {
            title: isNew ? '' : progress.title
         }
      })
      // -------------------------------------------------------------------------
      // EFFECTS
      // -------------------------------------------------------------------------

      // Reset form whenever task.title changes or editing state changes
      useEffect(() => {
         if (titleEditing.isEditing || isNew) {
            const currentTitle = isNew ? '' : progress.title
            methods.reset({
               title: currentTitle
            })
         }
      }, [progress.title, titleEditing.isEditing, isNew, methods])

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleDeleteProgress = useCallback(() => {
         const formData = {
            page_id: _id,
            progress_id: progress._id
         }
         deleteProgressAction(formData)
      }, [_id, progress._id, deleteProgressAction])

      const handleSubmitTitle = methods.handleSubmit(async (data) => {
         const formData = {
            page_id: _id,
            progress_id: progress._id,
            title: data.title || t('placeholder-untitled')
         }
         await updateProgressAction(formData)
         titleEditing.end()
      })

      const handleColorChange = useCallback(
         (color, title_color) => {
            const formData = {
               page_id: _id,
               progress_id: progress._id,
               color: color,
               title_color: title_color
            }
            updateProgressAction(formData)
         },
         [_id, progress._id, updateProgressAction]
      )

      const handleColorOptionClick = useCallback(
         (e, colorOption) => {
            e.preventDefault()
            if (colorOption.title_color !== progress.title_color) {
               handleColorChange(colorOption.color, colorOption.title_color)
            }
         },
         [progress.title_color, handleColorChange]
      )

      const handleMouseEnter = useCallback(
         (e) => {
            e.preventDefault()
            progressHover.start()
         },
         [progressHover]
      )

      const handleMouseLeave = useCallback(
         (e) => {
            e.preventDefault()
            progressHover.end()
         },
         [progressHover]
      )

      const handleInputBlur = useCallback(
         (e) => {
            e.preventDefault()
            if (!progress.isNew) {
               handleSubmitTitle()
            } else {
               e.currentTarget.select()
            }
         },
         [progress.isNew, handleSubmitTitle]
      )

      const handleEditClick = useCallback(
         (e) => {
            e.preventDefault()
            titleEditing.start()
         },
         [titleEditing]
      )

      const handleDeleteClick = useCallback(
         (e) => {
            e.preventDefault()
            handleDeleteProgress()
         },
         [handleDeleteProgress]
      )

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      // Memoize margin bottom calculation for performance
      const flexMarginBottom = useMemo(
         () => (titleEditing.isEditing || isNew ? -2 : undefined),
         [titleEditing.isEditing, isNew]
      )

      // Memoize menu button opacity
      const menuButtonOpacity = useMemo(
         () => (progressHover.isHovered || dropdownMenu.isOpen ? 1 : 0),
         [progressHover.isHovered, dropdownMenu.isOpen]
      )

      // Memoize delete button visibility
      const showDeleteButton = useMemo(
         () => progress_order.length > 1,
         [progress_order.length]
      )

      // Memoize color options rendering
      const colorOptions = useMemo(
         () =>
            progressColors.map((colorOption) => (
               <MenuItemOption
                  key={colorOption.title_color}
                  value={colorOption.title_color}
                  fontSize='sm'
                  onClick={(e) => handleColorOptionClick(e, colorOption)}
               >
                  <Flex alignItems='center' gap={2}>
                     {colorMode === 'dark' ? (
                        <Flex
                           color={colorOption.color}
                           border='0.5px solid'
                           borderColor={colorOption.title_color}
                           borderRadius='full'
                        >
                           <PiCircleFill size={18} />
                        </Flex>
                     ) : (
                        <Flex color={colorOption.title_color}>
                           <PiCircleDuotone size={18} />
                        </Flex>
                     )}
                     {colorOption.title}
                  </Flex>
               </MenuItemOption>
            )),
         [handleColorOptionClick, colorMode]
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
                  color={progress.title_color}
                  fontWeight={500}
                  borderRadius={0}
                  autoFocus
                  onBlur={handleInputBlur}
               />
            </form>
         </FormProvider>
      )

      const renderTitleDisplay = () => (
         <>
            <Text color={progress.title_color} fontWeight={500}>
               {progress.title}
            </Text>
            <Spacer />
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
                     icon={<PiPencilLine size={18} />}
                     fontSize='sm'
                     onClick={handleEditClick}
                  >
                     {t('btn-edit-name')}
                  </MenuItem>

                  <MenuDivider />
                  <MenuOptionGroup
                     defaultValue={progress.title_color}
                     title={t('label-color')}
                     fontSize='sm'
                     type='radio'
                  >
                     {colorOptions}
                  </MenuOptionGroup>
                  {showDeleteButton && (
                     <>
                        <MenuDivider />
                        <MenuItem
                           icon={<PiTrash size={18} />}
                           fontSize='sm'
                           color='danger.primary'
                           onClick={handleDeleteClick}
                        >
                           {t('btn-delete-column')}
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
         <Card
            variant='filled'
            bg={progress.color}
            paddingLeft={3}
            paddingRight={2}
            w={250}
            h={8}
            justifyContent='center'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
         >
            <Flex marginBottom={flexMarginBottom}>
               {titleEditing.isEditing || isNew
                  ? renderTitleInput()
                  : renderTitleDisplay()}
            </Flex>
         </Card>
      )
   }
)

// =============================================================================
// PROPTYPES & REDUX CONNECTION
// =============================================================================

ProgressHeader.propTypes = {
   progress: PropTypes.object.isRequired,
   isNew: PropTypes.bool,
   // Redux props
   _id: PropTypes.string.isRequired,
   progress_order: PropTypes.array.isRequired,
   updateProgressAction: PropTypes.func.isRequired,
   deleteProgressAction: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
   _id: state.page._id,
   progress_order: state.page.progress_order
})

const mapDispatchToProps = {
   deleteProgressAction,
   updateProgressAction
}

export default connect(mapStateToProps, mapDispatchToProps)(ProgressHeader)
