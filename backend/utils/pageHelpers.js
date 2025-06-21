const Page = require('../models/PageModel')

async function validatePage(pageId, userId) {
   const page = await Page.findById(pageId)
   if (!page || page.user.toString() !== userId) return null
   return page
}

module.exports = {
   validatePage
}
