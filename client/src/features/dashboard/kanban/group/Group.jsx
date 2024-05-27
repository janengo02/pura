import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { deleteGroup, updateGroup } from '../../../../actions/group'

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
   useDisclosure
} from '@chakra-ui/react'
import GroupTitle from '../../../../components/typography/GroupTitle'
import {
   PiCircleFill,
   PiDotsThreeBold,
   PiPencilLine,
   PiTrash
} from 'react-icons/pi'
import t from '../../../../lang/i18n'
import { FormProvider, useForm } from 'react-hook-form'
import { MultiInput } from '../../../../components/MultiInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { dashboardSchema as s } from '../../DashboardSchema'

import { groupColors } from '../../../../components/data/defaultColor'
import { useHover } from '../../../../hooks/useHover'
import { useEditing } from '../../../../hooks/useEditing'

const Group = ({
   group,
   isNew,
   children,
   // Redux props
   page: { page },
   updateGroup,
   deleteGroup
}) => {
   const groupHover = useHover()
   const titleEditing = useEditing()
   const dropdownMenu = useDisclosure()
   const delGroup = () => {
      const formData = {
         page_id: page._id,
         group_id: group._id
      }
      deleteGroup(formData)
   }
   const methods = useForm({
      resolver: yupResolver(s)
   })

   const onBlur = methods.handleSubmit(async (data) => {
      const formData = {
         page_id: page._id,
         group_id: group._id,
         title: data.title
      }
      if (formData.title === '') {
         formData.title = 'Untitled'
      }
      await updateGroup(formData)
      titleEditing.end()
   })

   const changeColor = (color) => {
      const formData = {
         page_id: page._id,
         group_id: group._id,
         color: color
      }
      updateGroup(formData)
   }
   return (
      <VStack
         p={3}
         paddingTop={2}
         gap={titleEditing.isEditing || isNew ? 0 : 2}
         borderWidth={2}
         borderColor='gray.100'
         borderRadius={8}
         alignItems='flex-start'
         onMouseEnter={(e) => {
            e.preventDefault()
            groupHover.start()
         }}
         onMouseLeave={(e) => {
            e.preventDefault()
            groupHover.end()
         }}
      >
         <Flex w='full' alignItems='center' gap={2}>
            {titleEditing.isEditing || isNew ? (
               <FormProvider {...methods} h='fit-content'>
                  <form noValidate autoComplete='on'>
                     <MultiInput
                        name='title'
                        type='text'
                        variant='unstyled'
                        placeholder={t('placeholder-untitled')}
                        validation={s.title}
                        defaultValue={group.title}
                        color={group.color}
                        fontWeight={600}
                        borderRadius={0}
                        autoFocus
                        onFocus={async (e) => {
                           e.preventDefault()
                           e.currentTarget.select()
                        }}
                        onBlur={async (e) => {
                           e.preventDefault()
                           onBlur()
                        }}
                     />
                  </form>
               </FormProvider>
            ) : (
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
                        colorScheme='gray'
                        color='gray.600'
                        opacity={
                           groupHover.isHovered || dropdownMenu.isOpen ? 1 : 0
                        }
                        onClick={dropdownMenu.onOpen}
                     ></MenuButton>
                     <MenuList>
                        <MenuItem
                           icon={<PiPencilLine size={18} />}
                           fontSize='sm'
                           onClick={async (e) => {
                              e.preventDefault()
                              titleEditing.start()
                           }}
                        >
                           {t('btn-edit-name')}
                        </MenuItem>
                        {page.group_order.length > 1 && (
                           <MenuItem
                              icon={<PiTrash size={18} />}
                              fontSize='sm'
                              onClick={async (e) => {
                                 e.preventDefault()
                                 delGroup()
                              }}
                           >
                              {t('btn-delete-group')}
                           </MenuItem>
                        )}
                        <MenuDivider />
                        <MenuOptionGroup
                           defaultValue={group.color}
                           title={t('label-color')}
                           fontSize='sm'
                           type='radio'
                        >
                           {groupColors.map((colorOption) => (
                              <MenuItemOption
                                 key={colorOption.color}
                                 value={colorOption.color}
                                 fontSize='sm'
                                 onClick={async (e) => {
                                    e.preventDefault()
                                    if (colorOption.color !== group.color) {
                                       changeColor(colorOption.color)
                                    }
                                 }}
                              >
                                 <Flex alignItems='center' gap={2}>
                                    <PiCircleFill
                                       size={18}
                                       color={colorOption.color}
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
         <Flex gap={3}>{children}</Flex>
      </VStack>
   )
}

Group.propTypes = {
   page: PropTypes.object.isRequired,
   deleteGroup: PropTypes.func.isRequired,
   updateGroup: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
   page: state.page
})

export default connect(mapStateToProps, { deleteGroup, updateGroup })(Group)
