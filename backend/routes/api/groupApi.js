const express = require('express')
const router = express.Router()

const { validationResult } = require('express-validator')
const auth = require('../../middleware/auth')

const Page = require('../../models/PageModel')
const Group = require('../../models/GroupModel')
const Task = require('../../models/TaskModel')

const {
   validateGroup,
   prepareGroupData,
   updateTaskMapForGroup
} = require('../../utils/groupHelpers')
const { validatePage } = require('../../utils/pageHelpers')
const { sendErrorResponse } = require('../../utils/responseHelper')

// @route   POST api/group/new/:page_id
// @desc    Create a new group for the specified page.
// @param   {string} page_id - The ID of the page where the group will be created.
// @body    {string} title - The title of the new group.
//          {string} color - The color of the new group.
// @access  Private
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
      const { newTaskMap } = updateTaskMapForGroup(page)

      const group = new Group(newGroup)
      await group.save()

      const updatedPage = await Page.findOneAndUpdate(
         { _id: req.params.page_id },
         { $push: { group_order: group }, $set: { update_date: new Date() } },
         { new: true }
      )

      updatedPage.task_map = newTaskMap
      await updatedPage.save()

      res.json({ group_id: group._id })
   } catch (error) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', error)
   }
})

// @route   POST api/group/update/:page_id/:group_id
// @desc    Update the specified group within the specified page.
// @param   {string} page_id - The ID of the page containing the group.
//          {string} group_id - The ID of the group to be updated.
// @body    {string} title - The new title for the group (optional).
//          {string} color - The new color for the group (optional).
// @access  Private
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

// @route   DELETE api/group/:page_id/:group_id
// @desc    Delete the specified group and its associated tasks from the specified page.
// @param   {string} page_id - The ID of the page containing the group.
//          {string} group_id - The ID of the group to be deleted.
// @access  Private
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

      const { newTasks, newTaskMap, newGroupOrder } = updateTaskMapForGroup(
         page,
         req.params.group_id
      )

      for (let taskId of newTasks) {
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
