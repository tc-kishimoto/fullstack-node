const Joi = require('joi');

const validation = {
  validateSubmission: (req, res, next) => {
    const schema = Joi.object({
      status: Joi.string().required(),
      comment: Joi.string().required(),
      url: Joi.when('status', {
        is: 'submission',
        then: Joi.string().uri(),
        otherwise: Joi.optional().allow('')
      }),
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(420).json({ error: error.details[0].message });
    }

    next();
  }
}
module.exports = validation;