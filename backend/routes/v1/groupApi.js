const express = require('express')
const router = express.Router()

const auth = require('../../middleware/auth')
const { validate } = require('../../middleware/validation')
const {
   validateCreateGroup,
   validateUpdateGroup,
   validateGroupParams
} = require('../../validators/groupValidators')

const prisma = require('../../config/prisma')

const {
   validateGroup,
   prepareGroupData,
   createGroup,
   deleteGroup
} = require('../../utils/groupHelpers')
const { validatePage } = require('../../utils/pageHelpers')
const { asyncHandler } = require('../../utils/asyncHandler')
const { NotFoundError } = require('../../utils/customErrors')

/**
 * @route POST api/group/new/:pageId
 * @desc Create new group
 * @access Private
 * @param {string} pageId
 * @body {string} title, color
 * @returns {Object} {group} created group object
 */
router.post(
   '/new/:pageId',
   auth,
   validate(validateCreateGroup),
   asyncHandler(async (req, res) => {
      const page = await validatePage(req.params.pageId, req.user.id)
      if (!page) {
         throw new NotFoundError(
            'Page not found or access denied',
            'page',
            'access'
         )
      }

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

      if (!currentPage) {
         throw new NotFoundError('Page not found', 'page', 'find')
      }

      // Update page with new group
      await prisma.page.update({
         where: { id: req.params.pageId },
         data: {
            groupOrder: [...currentPage.groupOrder, group.id],
            taskMap: newTaskMap,
            updateDate: new Date()
         }
      })

      res.json({ group: group })
   })
)

/**
 * @route POST api/group/update/:pageId/:groupId
 * @desc Update group properties
 * @access Private
 * @param {string} pageId, groupId
 * @body {string} [title], [color]
 * @returns {Object} Empty response on success
 */
router.post(
   '/update/:pageId/:groupId',
   auth,
   validate(validateUpdateGroup),
   asyncHandler(async (req, res) => {
      const page = await validatePage(req.params.pageId, req.user.id)
      if (!page)
         throw new NotFoundError(
            'Page not found or access denied',
            'page',
            'access'
         )

      const group = await validateGroup(req.params.groupId)
      if (!group) throw new NotFoundError('Group not found', 'group', 'access')

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
   })
)

/**
 * @route DELETE api/group/:pageId/:groupId
 * @desc Delete group and all associated tasks
 * @access Private
 * @param {string} pageId, groupId
 * @returns {Object} Empty response on success
 */
router.delete(
   '/:pageId/:groupId',
   auth,
   validate(validateGroupParams),
   asyncHandler(async (req, res) => {
      const page = await validatePage(req.params.pageId, req.user.id)
      if (!page)
         throw new NotFoundError(
            'Page not found or access denied',
            'page',
            'access'
         )

      const group = await validateGroup(req.params.groupId)
      if (!group) throw new NotFoundError('Group not found', 'group', 'access')

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
   })
)

module.exports = router
