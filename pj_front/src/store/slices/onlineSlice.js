// src/store/slices/onlineSlice.js
import { createSlice } from "@reduxjs/toolkit";

const onlineSlice = createSlice({
  name: "online",
  initialState: { count: 0 },
  reducers: {
    setOnlineCount(state, action) {
      state.count = action.payload;
    },
  },
});

export const { setOnlineCount } = onlineSlice.actions;
export default onlineSlice.reducer;
