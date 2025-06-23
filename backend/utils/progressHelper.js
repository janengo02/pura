const Progress = require('../models/ProgressModel')

async function validateProgress(progressId) {
   const progress = await Progress.findById(progressId)
   if (!progress) return null
   return progress
}

function prepareProgressData(body) {
   const { title, title_color, color } = body
   const data = {}
   if (title) data.title = title
   if (title_color) data.title_color = title_color
   if (color) data.color = color
   return data
}

module.exports = {
   validateProgress,
   prepareProgressData
}
