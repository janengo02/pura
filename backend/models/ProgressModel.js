const mongoose = require('mongoose')

const ProgressSchema = new mongoose.Schema({
   title: {
      type: String,
      default: ''
   },
   title_color: {
      type: String,
      default: 'kanban.progress.title.default'
   },
   color: {
      type: String,
      default: 'kanban.progress.default'
   },
   visibility: {
      type: Boolean,
      default: true
   },
   create_date: {
      type: Date,
      default: Date.now
   },
   update_date: {
      type: Date,
      default: Date.now
   }
})

module.exports = Progress = mongoose.model('progress', ProgressSchema) //name of the database
