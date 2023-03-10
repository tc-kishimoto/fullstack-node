const Joi = require('joi');

const validationErrorStatus = 420;

const speechOrDiscussionRule = Joi.when( 'speech_or_discussion', {
  is: Joi.string().valid('speech', 'discussion'),
  then: Joi.when('speech_or_discussion', {
    is: 'speech',
    then: Joi.string().required(),
    otherwise: Joi.optional().allow('')
  }),
  otherwise: Joi.when('speech_or_discussion', {
    is: 'discussion',
    then: Joi.string().required(),
    otherwise: Joi.optional().allow('')
  })
})

const dailyMainContentsRule = Joi.when('daily_type', {
  is: 'normal',
  then: Joi.string().required(),
  otherwise: Joi.optional().allow('')
})

const dailyPersonalDevelopRule = Joi.when('daily_type', {
  is: 'personal_develop',
  then: Joi.string().required(),
  otherwise: Joi.optional().allow('')
})

const dailyTeamDevelopRule = Joi.when('daily_type', {
  is: 'team_develop',
  then: Joi.string().required(),
  otherwise: Joi.optional().allow('')
})

const dailyTestRule = Joi.when('test_category', {
  is: Joi.string().valid('little_test', 'confirmation_test'),
  then: Joi.when('test_category', {
    is: 'little_test',
    then: Joi.string().required(),
    otherwise: Joi.optional().allow('')
  }),
  otherwise: Joi.when('test_category', {
    is: 'confirmation_test',
    then: Joi.string().required(),
    otherwise: Joi.optional().allow('')
  })
})

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
      return res.status(validationErrorStatus).json({ error: error.details[0].message });
    }

    next();
  },
  validateSubmissionAddComment: (req, res, next) =>  {
    const schema = Joi.object({
      comment: Joi.string().required(),
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(validationErrorStatus).json({ error: error.details[0].message });
    }

    next();
  },

  validateDaily: (req, res, next) =>  {
    const schema = Joi.object({
      course_name: Joi.string().required(),
      manner1: Joi.string().required(),
      manner2: Joi.string().required(),
      manner3: Joi.string().required(),
      manner4: Joi.string().required(),
      speech_theme: speechOrDiscussionRule,
      speech_task: speechOrDiscussionRule,
      speech_notice: speechOrDiscussionRule,
      speech_solution: speechOrDiscussionRule,
      main_overview: dailyMainContentsRule,
      main_achievement: dailyMainContentsRule,
      main_review: dailyMainContentsRule,
      main_review_cause: dailyMainContentsRule,
      main_solution: dailyMainContentsRule,
      test_taraget: dailyTestRule,
      score: dailyTestRule,
      personal_develop_theme: dailyPersonalDevelopRule,
      personal_develop_today_progress: dailyPersonalDevelopRule,
      personal_develop_overall_progress: dailyPersonalDevelopRule,
      personal_develop_planned_progress: dailyPersonalDevelopRule,
      personal_develop_work_content: dailyPersonalDevelopRule,
      personal_develop_task: dailyPersonalDevelopRule,
      personal_develop_solusion: dailyPersonalDevelopRule,
      team_develop_theme: dailyTeamDevelopRule,
      team_develop_today_progress: dailyTeamDevelopRule,
      team_develop_overall_progress: dailyTeamDevelopRule,
      team_develop_planned_progress: dailyTeamDevelopRule,
      team_develop_work_content: dailyTeamDevelopRule,
      team_develop_task: dailyTeamDevelopRule,
      team_develop_solusion: dailyTeamDevelopRule,
      free_description: Joi.string().required(),
    }).unknown(true);

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(validationErrorStatus).json({ error: error.details[0].message });
    }

    next();
  }
}
module.exports = validation;