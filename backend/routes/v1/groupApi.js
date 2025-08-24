const express = require('express')
const router = express.Router()

const { validationResult } = require('express-validator')
const auth = require('../../middleware/auth')

const prisma = require('../../config/prisma')

const {
   validateGroup,
   prepareGroupData,
   createGroup,
   deleteGroup
} = require('../../utils/groupHelpers')
const { validatePage } = require('../../utils/pageHelpers')
const { sendErrorResponse } = require('../../utils/responseHelper')

/**
 * @route POST api/group/new/:pageId
 * @desc Create new group
 * @access Private
 * @param {string} pageId
 * @body {string} title, color
 * @returns {Object} {group} created group object
 */
router.post('/new/:pageId', [auth], async (req, res) => {
   try {
      const page = await validatePage(req.params.pageId, req.user.id)
      if (!page) return sendErrorResponse(res, 404, 'page', 'access')

      const result = validationResult(req)
      if (!result.isEmpty())
         return sendErrorResponse(res, 400, 'validation', 'failed')

      const newGroup = prepareGroupData(req.body)
      const { taskMap: newTaskMap } = createGroup({
         tasks: page.tasks,
         taskMap: page.taskMap,
         groupOrder: page.groupOrder,
         progressOrder: page.progressOrder,
         newGroup
      })

      const group = await prisma.group.create({
         data: newGroup
      })

      // Get current page
      const currentPage = await prisma.page.findUnique({
         where: { id: req.params.pageId }
      })

      // Update page with new group
      const updatedPage = await prisma.page.update({
         where: { id: req.params.pageId },
         data: {
            groupOrder: [...currentPage.groupOrder, group.id],
            taskMap: newTaskMap,
            updateDate: new Date()
         }
      })

      res.json({ group: group })
   } catch (error) {
      sendErrorResponse(res, 500, 'group', 'create', error)
   }
})

/**
 * @route POST api/group/update/:pageId/:groupId
 * @desc Update group properties
 * @access Private
 * @param {string} pageId, groupId
 * @body {string} [title], [color]
 * @returns {Object} Empty response on success
 */
router.post('/update/:pageId/:groupId', [auth], async (req, res) => {
   try {
      const page = await validatePage(req.params.pageId, req.user.id)
      if (!page) return sendErrorResponse(res, 404, 'page', 'access')

      const group = await validateGroup(req.params.groupId)
      if (!group) return sendErrorResponse(res, 404, 'group', 'access')

      const result = validationResult(req)
      if (!result.isEmpty())
         return sendErrorResponse(res, 400, 'validation', 'failed')

      const { title, color } = req.body
      const updateData = { updateDate: new Date() }
      if (title) updateData.title = title
      if (color) updateData.color = color

      await prisma.group.update({
         where: { id: req.params.groupId },
         data: updateData
      })

      await prisma.page.update({
         where: { id: req.params.pageId },
         data: { updateDate: new Date() }
      })

      res.json()
   } catch (error) {
      sendErrorResponse(res, 500, 'group', 'update', error)
   }
})

/**
 * @route DELETE api/group/:pageId/:groupId
 * @desc Delete group and all associated tasks
 * @access Private
 * @param {string} pageId, groupId
 * @returns {Object} Empty response on success
 */
router.delete('/:pageId/:groupId', [auth], async (req, res) => {
   try {
      const page = await validatePage(req.params.pageId, req.user.id)
      if (!page) return sendErrorResponse(res, 404, 'page', 'access')

      const group = await validateGroup(req.params.groupId)
      if (!group) return sendErrorResponse(res, 404, 'group', 'access')

      const {
         groupOrder: newGroupOrder,
         tasks: newTasks,
         taskMap: newTaskMap
      } = deleteGroup({
         groupIndex: page.groupOrder.indexOf(req.params.groupId),
         progressOrder: page.progressOrder,
         groupOrder: page.groupOrder,
         tasks: page.tasks,
         taskMap: page.taskMap
      })

      // Delete tasks from DB if they're not in newTasks
      const tasksToDelete = page.tasks.filter(
         (taskId) => !newTasks.includes(taskId)
      )
      for (let taskId of tasksToDelete) {
         await prisma.task.delete({ where: { id: taskId } })
      }

      await prisma.group.delete({ where: { id: req.params.groupId } })

      await prisma.page.update({
         where: { id: req.params.pageId },
         data: {
            groupOrder: newGroupOrder,
            tasks: newTasks,
            taskMap: newTaskMap,
            updateDate: new Date()
         }
      })

      res.json()
   } catch (error) {
      sendErrorResponse(res, 500, 'group', 'delete', error)
   }
})

module.exports = router
