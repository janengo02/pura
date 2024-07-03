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
   const newTaskArray = Array.from(tasks)
   const newTaskMap = Array.from(task_map)
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
