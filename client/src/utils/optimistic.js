import cloneDeep from 'clone-deep'

export const optimisticMoveTask = (result, tasks, task_map) => {
   const { destination, source, draggableId } = result
   if (!destination) {
      return
   }
   if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
   ) {
      return
   }

   // update front end simultaneously
   const startSpace = +source.droppableId
   const endSpace = +destination.droppableId
   const oldTaskId = +draggableId
   const targetTask = tasks[oldTaskId]
   var newTaskId = destination.index
   if (endSpace !== 0) {
      newTaskId += task_map[endSpace - 1]
   }
   if (endSpace > startSpace) {
      newTaskId--
   }
   const newTaskArray = cloneDeep(tasks)
   const newTaskMap = cloneDeep(task_map)
   newTaskArray.splice(oldTaskId, 1)
   newTaskArray.splice(newTaskId, 0, targetTask)

   // Moving between different columns
   if (endSpace < startSpace) {
      for (let i = endSpace; i < startSpace; i++) {
         newTaskMap[i]++
      }
   } else {
      for (let i = startSpace; i < endSpace; i++) {
         newTaskMap[i]--
      }
   }
   return {
      task_map: newTaskMap,
      tasks: newTaskArray
   }
}
export const optimisticCreateProgress = (
   progress_id,
   progress_order,
   group_order,
   task_map
) => {
   if (progress_id === 'new') {
      const newProgress = {
         _id: 'new',
         title: '',
         title_color: '#4A5568',
         color: '#EDF2F7',
         visibility: true
      }
      var newTaskMap = cloneDeep(task_map)
      if (group_order.length > 0) {
         const n_group = group_order.length
         const m_progress = progress_order.length + 1
         for (let i = 1; i <= n_group; i++) {
            const task_count = newTaskMap[i * m_progress - 2]
            newTaskMap.splice(i * m_progress - 1, 0, task_count)
         }
      }
      const newProgressOrder = cloneDeep(progress_order)
      newProgressOrder.push(newProgress)
      return { progress_order: newProgressOrder, task_map: newTaskMap }
   } else {
      const newProgressOrder = progress_order.map((p) =>
         p._id === 'new'
            ? {
                 ...p,
                 _id: progress_id
              }
            : p
      )
      return { progress_order: newProgressOrder }
   }
}
export const optimisticUpdateProgress = (updatedProgress, progress_order) => {
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
export const optimisticDeleteProgress = (
   progress_id,
   progress_order,
   group_order,
   tasks,
   task_map
) => {
   const oldTasks = cloneDeep(tasks)
   const newTasks = []
   const oldTaskMap = cloneDeep(task_map)
   const newTaskMap = []
   const progressIndex = progress_order.findIndex((p) => p._id === progress_id)
   const groupCount = group_order.length
   const progressCount = progress_order.length

   let deletedCount = 0
   for (let i = 0; i < groupCount; i++) {
      for (let j = 0; j < progressCount; j++) {
         const currentMap = i * progressCount + j
         const currentMapCount = oldTaskMap[currentMap]
         let prevMapCount = 0
         if (currentMap !== 0) {
            prevMapCount = oldTaskMap[currentMap - 1]
         }
         if (j === progressIndex) {
            deletedCount += currentMapCount - prevMapCount
         } else {
            const newMapCount = currentMapCount - deletedCount
            newTaskMap.push(newMapCount)
            for (let t = prevMapCount; t < currentMapCount; t++) {
               newTasks.push(oldTasks[t])
            }
         }
      }
   }
   const newProgressOrder = cloneDeep(progress_order)
   newProgressOrder.splice(progressIndex, 1)
   return {
      progress_order: newProgressOrder,
      tasks: newTasks,
      task_map: newTaskMap
   }
}
