const logger = require('../utils/logger')

/**
 * Request logging middleware
 * Logs all HTTP requests with timing and context information
 * Adds requestId to each request for correlation
 */
const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.requestId = logger.generateRequestId()
  
  // Start timer
  const startTime = Date.now()
  
  // Create child logger with request context
  req.logger = logger.child({
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('user-agent'),
    ip: req.ip || req.connection.remoteAddress
  })

  // Log incoming request
  req.logger.info('Incoming request', {
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query,
    params: req.params
  })

  // Override res.end to capture response time and log
  const originalEnd = res.end
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime
    
    // Log request completion
    logger.logRequest(req, res, responseTime)
    
    // Call original end method
    originalEnd.call(res, chunk, encoding)
  }

  next()
}

module.exports = requestLogger