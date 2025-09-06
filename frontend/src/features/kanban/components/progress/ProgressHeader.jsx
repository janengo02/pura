// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useCallback, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

// Redux
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'


// RTK Query
import { useUpdateProgressMutation, useDeleteProgressMutation } from '../../api/pageApi'

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
import { MultiInput } from '../../../../shared/components/formInput/MultiInput'

// External Libraries
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// Utils & Icons
import { useReactiveTranslation } from '../../../../shared/hooks/useReactiveTranslation'
import {
   PiCircleDuotone,
   PiCircleFill,
   PiDotsThreeBold,
   PiPencilLine,
   PiTrash
} from 'react-icons/pi'

// Schema & Data
import { dashboardSchema as s } from '../../../dashboard/components/DashboardSchema'
import { progressColors } from '../../../../shared/constants/defaultColor'

// Custom Hooks
import { useHover } from '../../../../shared/hooks/useHover'
import { useEditing } from '../../../../shared/hooks/useEditing'


// =============================================================================
// SELECTORS
// =============================================================================

const selectProgressData = createSelector(
   [state => state.pageSlice.id, state => state.pageSlice.progressOrder],
   (id, progressOrder) => ({ id, progressOrder })
)

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ProgressHeader = React.memo(
   ({
      progress,
      isNew = false
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()
      const { colorMode } = useColorMode()

      // Redux selectors
      const { id, progressOrder } = useSelector(selectProgressData)

      // RTK Query hooks
      const [updateProgressMutation] = useUpdateProgressMutation()
      const [deleteProgressMutation] = useDeleteProgressMutation()

      const progressHover = useHover()
      const titleEditing = useEditing()
      const dropdownMenu = useDisclosure()

      const methods = useForm({
         resolver: yupResolver(s),
         defaultValues: {
            title: isNew ? '' : progress.title
         }
      })

      // Ref for programmatic focus
      const titleInputRef = useRef(null)

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

      // Focus the input when editing or creating new progress
      useEffect(() => {
         if ((titleEditing.isEditing || isNew) && titleInputRef.current) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
               titleInputRef.current?.focus()
            }, 0)
            return () => clearTimeout(timer)
         }
      }, [titleEditing.isEditing, isNew])

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleDeleteProgress = useCallback(() => {
         const formData = {
            pageId: id,
            progressId: progress.id
         }
         deleteProgressMutation(formData)
      }, [id, progress.id, deleteProgressMutation])

      const handleSubmitTitle = methods.handleSubmit(async (data) => {
         const formData = {
            pageId: id,
            progressId: progress.id,
            title: data.title || t('placeholder-untitled')
         }
         await updateProgressMutation(formData)
         titleEditing.end()
      })

      const handleColorChange = useCallback(
         (color, titleColor) => {
            const formData = {
               pageId: id,
               progressId: progress.id,
               color: color,
               titleColor: titleColor
            }
            updateProgressMutation(formData)
         },
         [id, progress.id, updateProgressMutation]
      )

      const handleColorOptionClick = useCallback(
         (e, colorOption) => {
            e.preventDefault()
            if (colorOption.titleColor !== progress.titleColor) {
               handleColorChange(colorOption.color, colorOption.titleColor)
            }
         },
         [progress.titleColor, handleColorChange]
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
         () => progressOrder.length > 1,
         [progressOrder.length]
      )

      // Memoize color options rendering
      const colorOptions = useMemo(
         () =>
            progressColors.map((colorOption) => (
               <MenuItemOption
                  key={colorOption.titleColor}
                  value={colorOption.titleColor}
                  fontSize='md'
                  onClick={(e) => handleColorOptionClick(e, colorOption)}
               >
                  <Flex alignItems='center' gap={2}>
                     {colorMode === 'dark' ? (
                        <Flex
                           color={colorOption.color}
                           border='0.5px solid'
                           borderColor={colorOption.titleColor}
                           borderRadius='full'
                        >
                           <PiCircleFill size={18} />
                        </Flex>
                     ) : (
                        <Flex color={colorOption.titleColor}>
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
                  ref={titleInputRef}
                  name='title'
                  type='text'
                  variant='unstyled'
                  placeholder={t('placeholder-untitled')}
                  validation={s.title}
                  color={progress.titleColor}
                  fontWeight={600}
                  borderRadius={0}
                  onBlur={handleInputBlur}
               />
            </form>
         </FormProvider>
      )

      const renderTitleDisplay = () => (
         <>
            <Text color={progress.titleColor} fontWeight={600}>
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
                  icon={<PiDotsThreeBold size={18} />}
                  variant='ghost'
                  size='sm'
                  colorScheme={colorMode === 'dark' ? 'white' : 'blackAlpha'}
                  opacity={menuButtonOpacity}
                  onClick={dropdownMenu.onOpen}
               />
               <MenuList>
                  <MenuItem
                     icon={<PiPencilLine size={18} />}
                     fontSize='md'
                     onClick={handleEditClick}
                  >
                     {t('btn-edit-name')}
                  </MenuItem>

                  <MenuDivider />
                  <MenuOptionGroup
                     defaultValue={progress.titleColor}
                     title={t('label-color')}
                     fontSize='md'
                     type='radio'
                  >
                     {colorOptions}
                  </MenuOptionGroup>
                  {showDeleteButton && (
                     <>
                        <MenuDivider />
                        <MenuItem
                           icon={<PiTrash size={18} />}
                           fontSize='md'
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
            paddingRight={1}
            w={250}
            h={10}
            justifyContent='center'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
         >
            <Flex marginBottom={flexMarginBottom} alignItems='center'>
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
   isNew: PropTypes.bool
}

export default ProgressHeader
