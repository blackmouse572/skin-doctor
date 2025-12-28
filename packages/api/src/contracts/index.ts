import { oc } from '@orpc/contract';
import postContract from './posts';
import skinAnalysisContract from './skin-analysis';

export const appContract = oc
  .errors({
    INPUT_VALIDATION_FAILED: {
      status: 422,
    },
    UNAUTHORIZED: {
      status: 401,
      message: 'Missing user session. Please log in!',
    },
    FORBIDDEN: {
      status: 403,
      message: 'You do not have enough permission to perform this action.',
    },
  })
  .router({
    posts: postContract,
    skinAnalysis: skinAnalysisContract,
  });
