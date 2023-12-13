const mongoose = require('mongoose')

const ProgressSchema = new mongoose.Schema({
   title: {
      type: String,
      default: 'Untitled',
      required: true
   },
   title_color: {
      type: String,
      required: true
   },
   color: {
      type: String,
      required: true
   },
   visibility: {
      type: Boolean,
      default: true,
      required: true
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
