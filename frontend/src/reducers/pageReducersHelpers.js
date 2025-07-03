export const updateProgress = ({ progress_order, updatedProgress }) => {
   const { title, title_color, color, progress_id } = updatedProgress
   const newProgressOrder = progress_order.map((p) =>
      p._id === progress_id
         ? {
              ...p,
              ...(title && { title }),
              ...(title_color && { title_color }),
              ...(color && { color })
           }
         : p
   )
   return { progress_order: newProgressOrder }
}

export const updateGroup = ({ group_order, updatedGroup }) => {
   const { title, color, group_id } = updatedGroup
   const newGroupOrder = group_order.map((g) =>
      g._id === group_id
         ? {
              ...g,
              ...(title && { title }),
              ...(color && { color })
           }
         : g
   )
   return { group_order: newGroupOrder }
}
