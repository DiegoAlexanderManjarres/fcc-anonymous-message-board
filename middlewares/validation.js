const { body, check, validationResult } = require('express-validator/check')


exports.check_id = property => {
   return check(property).trim().isLength({ min: 24, max: 26 })
}

exports.checkText = () => {
   return check('text').trim().isLength({ min: 3, max: 800 })
}

exports.checkPassword = () => {
   return check('delete_password').trim().isLength({ min: 4, max: 16})
}

exports.checkBoard = () => {
   return check('board').trim().isLength({ min: 3, max: 30 })
}

exports.validationErrors = (req, res, next) => {
   try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
         //console.log(errors.array())
         const error = new Error('input validation error')
         error.data = errors.array()
         throw error
      }
      return next()
   } catch (err) { 
      console.error('/*/*/*/*/*\n', err, '\n/*/*/*/*/*/*')
      return res.status(200).type('text').send('invalid input')
   }
}