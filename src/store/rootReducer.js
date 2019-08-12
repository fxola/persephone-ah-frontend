import { combineReducers } from 'redux';
import themeToggler from '../views/LandingPage/index.reducer';
import authReducer from '../views/SignupPage/signup.reducer';
import loginReducer from '../views/LoginPage/login.reducer';
import singleArticleReducer from '../views/ReadArticlePage/readArticle.reducer';

const rootReducer = combineReducers({
  theme: themeToggler,
  signup: authReducer,
  user: loginReducer,
  readArticle: singleArticleReducer
});

export default rootReducer;
