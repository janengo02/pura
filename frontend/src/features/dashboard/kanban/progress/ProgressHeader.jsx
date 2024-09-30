import React, { useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
   deleteProgress,
   updateProgress
} from '../../../../actions/progressActions'
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
   useDisclosure
} from '@chakra-ui/react'
import {
   PiCircleDuotone,
   PiDotsThreeBold,
   PiPencilLine,
   PiTrash
} from 'react-icons/pi'
import t from '../../../../lang/i18n'
import { FormProvider, useForm } from 'react-hook-form'
import { MultiInput } from '../../../../components/MultiInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { dashboardSchema as s } from '../../DashboardSchema'
import { progressColors } from '../../../../components/data/defaultColor'

const ProgressHeader = ({
   progress,
   isNew,
   // Redux props
   updateProgress,
   deleteProgress,
   _id,
   progress_order
}) => {
   const [hovered, setHovered] = useState(false)
   const [editing, setEditing] = useState(false)
   const dropdownMenu = useDisclosure()
   const delProgress = () => {
      const formData = {
         page_id: _id,
         progress_id: progress._id
      }
      deleteProgress(formData)
   }
   const methods = useForm({
      resolver: yupResolver(s)
   })

   const onBlur = methods.handleSubmit(async (data) => {
      const formData = {
         page_id: _id,
         progress_id: progress._id,
         title: data.title
      }
      if (formData.title === '') {
         formData.title = 'Untitled'
      }
      await updateProgress(formData)
      setEditing(false)
   })

   const changeColor = (color, title_color) => {
      const formData = {
         page_id: _id,
         progress_id: progress._id,
         color: color,
         title_color: title_color
      }
      updateProgress(formData)
   }
   return (
      <Card
         variant='filled'
         bg={progress.color}
         paddingLeft={3}
         paddingRight={2}
         w={250}
         h={8}
         justifyContent='center'
         onMouseEnter={(e) => {
            e.preventDefault()
            setHovered(true)
         }}
         onMouseLeave={(e) => {
            e.preventDefault()
            setHovered(false)
         }}
      >
         <Flex marginBottom={editing || isNew ? -2 : undefined}>
            {editing || isNew ? (
               <FormProvider {...methods} h='fit-content'>
                  <form noValidate autoComplete='on'>
                     <MultiInput
                        name='title'
                        type='text'
                        variant='unstyled'
                        placeholder={t('placeholder-untitled')}
                        validation={s.title}
                        defaultValue={progress.title}
                        color={progress.title_color}
                        fontWeight={600}
                        borderRadius={0}
                        autoFocus
                        onFocus={async (e) => {
                           e.preventDefault()
                           e.currentTarget.select()
                        }}
                        onBlur={async (e) => {
                           e.preventDefault()
                           if (!progress.isNew) {
                              onBlur()
                           } else {
                              e.currentTarget.select()
                           }
                        }}
                     />
                  </form>
               </FormProvider>
            ) : (
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
                        colorScheme='blackAlpha'
                        opacity={hovered || dropdownMenu.isOpen ? 1 : 0}
                        onClick={dropdownMenu.onOpen}
                     ></MenuButton>
                     <MenuList>
                        <MenuItem
                           icon={<PiPencilLine size={18} />}
                           fontSize='sm'
                           onClick={async (e) => {
                              e.preventDefault()
                              setEditing(true)
                           }}
                        >
                           {t('btn-edit-name')}
                        </MenuItem>
                        {progress_order.length > 1 && (
                           <MenuItem
                              icon={<PiTrash size={18} />}
                              fontSize='sm'
                              onClick={async (e) => {
                                 e.preventDefault()
                                 delProgress()
                              }}
                           >
                              {t('btn-delete-column')}
                           </MenuItem>
                        )}
                        <MenuDivider />
                        <MenuOptionGroup
                           defaultValue={progress.title_color}
                           title={t('label-color')}
                           fontSize='sm'
                           type='radio'
                        >
                           {progressColors.map((colorOption) => (
                              <MenuItemOption
                                 key={colorOption.title_color}
                                 value={colorOption.title_color}
                                 fontSize='sm'
                                 onClick={async (e) => {
                                    e.preventDefault()
                                    if (
                                       colorOption.title_color !==
                                       progress.title_color
                                    ) {
                                       changeColor(
                                          colorOption.color,
                                          colorOption.title_color
                                       )
                                    }
                                 }}
                              >
                                 <Flex alignItems='center' gap={2}>
                                    <PiCircleDuotone
                                       size={18}
                                       color={colorOption.title_color}
                                    />
                                    {colorOption.title}
                                 </Flex>
                              </MenuItemOption>
                           ))}
                        </MenuOptionGroup>
                     </MenuList>
                  </Menu>
               </>
            )}
         </Flex>
      </Card>
   )
}

ProgressHeader.propTypes = {
   _id: PropTypes.string.isRequired,
   progress_order: PropTypes.array.isRequired,

   deleteProgress: PropTypes.func.isRequired,
   updateProgress: PropTypes.func.isRequired,
   page: PropTypes.object
}

const mapStateToProps = (state) => ({
   _id: state.page._id,
   progress_order: state.page.progress_order
})
export default connect(mapStateToProps, { deleteProgress, updateProgress })(
   ProgressHeader
)
