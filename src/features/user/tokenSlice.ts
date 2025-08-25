import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user';

type TokenState = {
  token: string | null;
};

const initialState: TokenState = {
  token: null,
};

export const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
    },
  },
});

export const { setToken, clearToken } = tokenSlice.actions;
export default tokenSlice.reducer;
