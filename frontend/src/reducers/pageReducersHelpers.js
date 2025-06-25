export const confirmCreateProgress = ({
   progress_order,
   tempProgressId,
   progressId
}) => {
   const newProgressOrder = progress_order.map((progress) =>
      progress._id === tempProgressId
         ? { ...progress, _id: progressId }
         : progress
   )
   return { progress_order: newProgressOrder }
}

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

export const confirmCreateGroup = ({ group_order, tempGroupId, groupId }) => {
   const newGroupOrder = group_order.map((group) =>
      group._id === tempGroupId ? { ...group, _id: groupId } : group
   )
   return { group_order: newGroupOrder }
}

export const confirmCreateTask = ({ tasks, tempTaskId, taskId }) => {
   const newTasks = tasks.map((task) =>
      task._id === tempTaskId ? { ...task, _id: taskId } : task
   )
   return { tasks: newTasks }
}
