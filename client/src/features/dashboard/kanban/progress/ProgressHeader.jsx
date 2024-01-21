import React, { useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { deleteProgress } from '../../../../actions/progress'

import {
   Card,
   Flex,
   IconButton,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   Spacer,
   Text,
   useDisclosure
} from '@chakra-ui/react'
import { PiDotsThreeBold, PiPlusBold, PiTrash } from 'react-icons/pi'
import t from '../../../../lang/i18n'

const ProgressHeader = ({
   deleteProgress,
   page_id,
   progressCount,
   progress
}) => {
   const [hovered, setHovered] = useState(false)
   const dropdownMenu = useDisclosure()
   const delProgress = () => {
      const formData = {
         page_id: page_id,
         progress_id: progress._id
      }
      deleteProgress(formData)
   }
   return (
      <Card
         variant='filled'
         bg={progress.color}
         paddingLeft={3}
         paddingRight={1}
         paddingY={1}
         w={250}
         onMouseEnter={(e) => {
            e.preventDefault()
            setHovered(true)
         }}
         onMouseLeave={(e) => {
            e.preventDefault()
            setHovered(false)
         }}
      >
         <Flex w='full' alignItems='center'>
            <Text color={progress.title_color} fontWeight={500}>
               {progress.title}
            </Text>
            <Spacer />
            <Flex alignItems='center'>
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
                     {progressCount > 1 && (
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
                  </MenuList>
               </Menu>
               <IconButton
                  aria-label='Options'
                  icon={<PiPlusBold />}
                  variant='ghost'
                  colorScheme='blackAlpha'
                  size='xs'
                  opacity={hovered || dropdownMenu.isOpen ? 1 : 0}
               />
            </Flex>
         </Flex>
      </Card>
   )
}

ProgressHeader.propTypes = {
   deleteProgress: PropTypes.func.isRequired
}

export default connect(null, { deleteProgress })(ProgressHeader)
