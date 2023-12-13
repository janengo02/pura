const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
   title: {
      type: String,
      default: 'Untitled',
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

module.exports = Group = mongoose.model('group', GroupSchema) //name of the database
