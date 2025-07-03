const getNewMap = (page, task_id, group_id = null, progress_id = null) => {
   const taskIndex = page.tasks.findIndex((t) => t.equals(task_id))
   let taskMapIndex = 0
   if (page.task_map[0] <= taskIndex) {
      for (let i = 1; i < page.task_map.length; i++) {
         if (
            page.task_map[i - 1] <= taskIndex &&
            page.task_map[i] > taskIndex
         ) {
            taskMapIndex = i
            break
         }
      }
   }
   const progressIndex = taskMapIndex % page.progress_order.length
   const groupIndex = parseInt(
      (taskMapIndex - progressIndex) / page.progress_order.length
   )

   let newProgressIndex = progressIndex
   let newGroupIndex = groupIndex
   let newTaskMapIndex = taskMapIndex
   const newTaskArray = page.tasks.slice()
   const newTaskMap = page.task_map.slice()

   if (group_id) {
      newGroupIndex = page.group_order.indexOf(group_id)
      newTaskMapIndex =
         newGroupIndex * page.progress_order.length + progressIndex
   }
   if (progress_id) {
      newProgressIndex = page.progress_order.indexOf(progress_id)
      newTaskMapIndex =
         groupIndex * page.progress_order.length + newProgressIndex
   }
   if (group_id || progress_id) {
      const targetTask = page.tasks[taskIndex]

      let newTaskIndex = page.task_map[newTaskMapIndex]
      if (newTaskMapIndex > taskMapIndex) {
         newTaskIndex--
      }
      newTaskArray.splice(taskIndex, 1)
      newTaskArray.splice(newTaskIndex, 0, targetTask)
      // Moving between different columns
      if (newTaskMapIndex < taskMapIndex) {
         for (let i = newTaskMapIndex; i < taskMapIndex; i++) {
            newTaskMap[i]++
         }
      } else {
         for (let i = taskMapIndex; i < newTaskMapIndex; i++) {
            newTaskMap[i]--
         }
      }
   }

   return { newTaskArray, newTaskMap, newGroupIndex, newProgressIndex }
}

module.exports = {
   getNewMap
}
