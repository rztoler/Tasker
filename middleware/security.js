const sanitizeHtml = require('sanitize-html');

const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return sanitizeHtml(str, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'discard'
    }).trim();
  };

  const sanitizeObject = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = typeof value === 'string' ? sanitizeString(value) : sanitizeObject(value);
    }
    return sanitized;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

const validateContentType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('Content-Type');
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('application/x-www-form-urlencoded'))) {
      return res.status(400).json({ error: 'Invalid content type' });
    }
  }
  next();
};

const detectPromptInjection = (text) => {
  if (typeof text !== 'string') return false;
  
  const suspiciousPatterns = [
    /ignore\s+previous\s+instructions/i,
    /system\s*:/i,
    /assistant\s*:/i,
    /human\s*:/i,
    /you\s+are\s+now/i,
    /forget\s+everything/i,
    /new\s+instructions/i,
    /override\s+instructions/i,
    /<\s*script/i,
    /javascript\s*:/i,
    /data\s*:/i,
    /vbscript\s*:/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(text));
};

const validateInput = (req, res, next) => {
  const checkForInjection = (obj) => {
    if (typeof obj === 'string') {
      if (detectPromptInjection(obj)) {
        throw new Error('Potential prompt injection detected');
      }
    } else if (obj && typeof obj === 'object') {
      Object.values(obj).forEach(checkForInjection);
    }
  };

  try {
    if (req.body) checkForInjection(req.body);
    if (req.query) checkForInjection(req.query);
    if (req.params) checkForInjection(req.params);
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Invalid input detected' });
  }
};

module.exports = {
  sanitizeInput,
  validateContentType,
  validateInput,
  detectPromptInjection
};