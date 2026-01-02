import imagesRouter from './images';
import postRouter from './post';
import skinAnalysisRouter from './skin-analysis';

export const appRouter = {
  posts: postRouter,
  skinAnalysis: skinAnalysisRouter,
  images: imagesRouter,
};
