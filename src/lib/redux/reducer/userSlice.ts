import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Permission = {
  name: string;
  category: string;
};

type Role = {
  id: string;
  name: string;
  permissions: Permission[];
};

type User = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  status: string;
  address?: string;
  profile_image?: string;
  role: Role;
  employee?: Employee;
};

type Employee = {
  id: string;
  nric_fin_no: string;
}

type UserState = {
  user: User | null;
};

const initialState: UserState = {
  user: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
