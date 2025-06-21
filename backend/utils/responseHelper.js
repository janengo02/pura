const sendErrorResponse = (res, code, title, msg, error = null) => {
   if (error) {
      console.error('---ERROR---:', error.message || error)
      if (error.kind === 'ObjectId') {
         res.status(404).json({
            errors: [
               { code: 404, title: 'alert-oops', msg: 'alert-page-notfound' }
            ]
         })
         return
      }
   }
   res.status(code).json({
      errors: [{ code, title, msg }]
   })
}

module.exports = { sendErrorResponse }
