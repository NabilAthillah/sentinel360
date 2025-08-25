import { combineReducers } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import tokenReducer from '../features/user/tokenSlice';

const rootReducer = combineReducers({
  user: userReducer,
  token: tokenReducer
});

export default rootReducer;
