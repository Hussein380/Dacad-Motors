/**
 * Middleware to parse stringified JSON fields from FormData (sent by multer)
 * into actual objects/arrays so Joi can validate them correctly.
 */
const parseFormData = (fields) => {
    return (req, res, next) => {
        if (req.body) {
            fields.forEach(field => {
                if (typeof req.body[field] === 'string') {
                    try {
                        // Try to parse as JSON (for arrays/objects)
                        req.body[field] = JSON.parse(req.body[field]);
                    } catch (e) {
                        // If it fails, check if it's a comma-separated string (for simple arrays like features)
                        if (req.body[field].includes(',')) {
                            req.body[field] = req.body[field].split(',').map(f => f.trim()).filter(f => f !== '');
                        }
                        // Otherwise leave as is (string)
                    }
                }
            });
        }
        next();
    };
};

module.exports = parseFormData;
