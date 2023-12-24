const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
   title: {
      type: String,
      default: 'GROUP'
   },
   color: {
      type: String,
      default: '#63b3ed'
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

module.exports = Group = mongoose.model('group', GroupSchema) //name of the database
