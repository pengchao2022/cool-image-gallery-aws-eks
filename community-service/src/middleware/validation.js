const Joi = require('joi');

exports.createDiscussion = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().max(200).required(),
    content: Joi.string().max(5000).required(),
    tags: Joi.array().items(Joi.string().max(20)).max(5)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      message: error.details[0].message 
    });
  }
  next();
};

exports.createReply = (req, res, next) => {
  const schema = Joi.object({
    content: Joi.string().max(2000).required(),
    parentReply: Joi.string().hex().length(24)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      message: error.details[0].message 
    });
  }
  next();
};