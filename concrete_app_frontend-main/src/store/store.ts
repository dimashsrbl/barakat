import { configureStore } from '@reduxjs/toolkit';
import apiReducer from './features/apiSlice';
import { thunk } from 'redux-thunk';

const store = configureStore({
  reducer: {
    api: apiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
})

export default store
