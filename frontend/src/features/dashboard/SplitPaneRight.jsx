import React, { useContext } from 'react'
import { Box } from '@chakra-ui/react'

// *** Context & hooks ***
import SplitPaneContext from '../../context/SplitPaneContext'

// *** Components ***
import Calendar from './Calendar'

const SplitPaneRight = React.memo(() => {
   // ==== Context & hooks ====
   const { rightRef } = useContext(SplitPaneContext)

   // ==== Render ====
   return (
      <Box ref={rightRef} w='full' h='full' overflow='auto'>
         <Calendar />
      </Box>
   )
})

export default SplitPaneRight
