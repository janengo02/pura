const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
   page:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'page', //refer to the 'page' model
      required: true
   },
   group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'progress', //refer to the 'group' model
      required: true
   },
   progress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'progress', //refer to the 'progress' model
      required: true
   },
   title: {
      type: String,
      default: 'Untitled',
      required: true
   },
   schedule: [
      {
         datetime_from: {
            type: Date
         },
         datetime_to: {
            type: Date
         }
      }
   ],
   content: {
      type: String
   },
   archive: {
      type: Boolean,
      default: false,
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

module.exports = Task = mongoose.model('task', TaskSchema) //name of the database
