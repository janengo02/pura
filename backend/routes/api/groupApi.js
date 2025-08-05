const express = require('express')
const router = express.Router()

const { validationResult } = require('express-validator')
const auth = require('../../middleware/auth')

const Page = require('../../models/PageModel')
const Group = require('../../models/GroupModel')
const Task = require('../../models/TaskModel')

const { validateGroup, prepareGroupData } = require('../../utils/groupHelpers')
const { validatePage } = require('../../utils/pageHelpers')
const { sendErrorResponse } = require('../../utils/responseHelper')

const { createGroup, deleteGroup } = require('../../../shared/utils')

/**
 * @route POST api/group/new/:page_id
 * @desc Create new group
 * @access Private
 * @param {string} page_id
 * @body {string} title, color
 * @returns {Object} {group} created group object
 */
router.post('/new/:page_id', [auth], async (req, res) => {
   try {
      const page = await validatePage(req.params.page_id, req.user.id)
      if (!page)
         return sendErrorResponse(res, 404, 'alert-oops', 'alert-page-notfound')

      const result = validationResult(req)
      if (!result.isEmpty())
         return sendErrorResponse(
            res,
            400,
            'alert-oops',
            'alert-validation-error',
            result.array()
         )

      const newGroup = prepareGroupData(req.body)
      const { task_map: newTaskMap } = createGroup({
         tasks: page.tasks,
         task_map: page.task_map,
         group_order: page.group_order,
         progress_order: page.progress_order,
         newGroup
      })

      const group = new Group(newGroup)
      await group.save()

      const updatedPage = await Page.findOneAndUpdate(
         { _id: req.params.page_id },
         { $push: { group_order: group }, $set: { update_date: new Date() } },
         { new: true }
      )

      updatedPage.task_map = newTaskMap
      await updatedPage.save()

      res.json({ group: group })
   } catch (error) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', error)
   }
})

/**
 * @route POST api/group/update/:page_id/:group_id
 * @desc Update group properties
 * @access Private
 * @param {string} page_id, group_id
 * @body {string} [title], [color]
 * @returns {Object} Empty response on success
 */
router.post('/update/:page_id/:group_id', [auth], async (req, res) => {
   try {
      const page = await validatePage(req.params.page_id, req.user.id)
      if (!page)
         return sendErrorResponse(res, 404, 'alert-oops', 'alert-page-notfound')

      const group = await validateGroup(req.params.group_id)
      if (!group)
         return sendErrorResponse(
            res,
            404,
            'alert-oops',
            'alert-group-notfound'
         )

      const result = validationResult(req)
      if (!result.isEmpty())
         return sendErrorResponse(
            res,
            400,
            'alert-oops',
            'alert-validation-error',
            result.array()
         )

      const { title, color } = req.body
      group.update_date = new Date()
      if (title) group.title = title
      if (color) group.color = color

      await group.save()

      await Page.findOneAndUpdate(
         { _id: req.params.page_id },
         { $set: { update_date: new Date() } },
         { new: true }
      )

      res.json()
   } catch (error) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', error)
   }
})

/**
 * @route DELETE api/group/:page_id/:group_id
 * @desc Delete group and all associated tasks
 * @access Private
 * @param {string} page_id, group_id
 * @returns {Object} Empty response on success
 */
router.delete('/:page_id/:group_id', [auth], async (req, res) => {
   try {
      const page = await validatePage(req.params.page_id, req.user.id)
      if (!page)
         return sendErrorResponse(res, 404, 'alert-oops', 'alert-page-notfound')

      const group = await validateGroup(req.params.group_id)
      if (!group)
         return sendErrorResponse(
            res,
            404,
            'alert-oops',
            'alert-group-notfound'
         )

      const {
         group_order: newGroupOrder,
         tasks: newTasks,
         task_map: newTaskMap
      } = deleteGroup({
         groupIndex: page.group_order.indexOf(req.params.group_id),
         progress_order: page.progress_order,
         group_order: page.group_order,
         tasks: page.tasks,
         task_map: page.task_map
      })

      // Delete tasks from DB if they're not in newTasks
      const tasksToDelete = page.tasks.filter(
         (taskId) => !newTasks.some((newTaskId) => taskId.equals(newTaskId))
      )
      for (let taskId of tasksToDelete) {
         await Task.deleteOne({ _id: taskId })
      }

      await group.deleteOne()

      page.group_order = newGroupOrder
      page.tasks = newTasks
      page.task_map = newTaskMap
      page.update_date = new Date()
      await page.save()

      res.json()
   } catch (error) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', error)
   }
})

module.exports = router
