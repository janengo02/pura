const mongoose = require('mongoose')

const ProgressSchema = new mongoose.Schema({
   title: {
      type: String,
      default: ''
   },
   title_color: {
      type: String,
      default: '#4A5568'
   },
   color: {
      type: String,
      default: '#EDF2F7'
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
