import { createSelector } from 'reselect'

const getPageState = (state) => state.page

export const selectPageId = createSelector(
   [getPageState],
   (page) => page._id
)

export const selectGroupOrder = createSelector(
   [getPageState],
   (page) => page.group_order
)

export const selectGroupOrderLength = createSelector(
   [selectGroupOrder],
   (groupOrder) => groupOrder.length
)

export const selectCanDeleteGroup = createSelector(
   [selectGroupOrderLength],
   (groupOrderLength) => groupOrderLength > 1
)