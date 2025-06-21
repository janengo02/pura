const sendErrorResponse = (res, code, title, msg, error = null) => {
   if (error) {
      console.error('---ERROR---:', error.message || error)
   }
   res.status(code).json({
      errors: [{ code, title, msg }]
   })
}

module.exports = { sendErrorResponse }
