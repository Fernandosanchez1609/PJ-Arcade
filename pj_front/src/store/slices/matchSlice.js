// src/store/slices/matchSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  rivalSocketId: null,
  rivalUserId: null,
  rivalName: null,
  playerRole: null,
};

const matchSlice = createSlice({
  name: "match",
  initialState,
  reducers: {

    setRivalSocket(state, action) {
      state.rivalSocketId = action.payload;
    },

    setRivalUser(state, action) {
      state.rivalUserId = action.payload.userId;
      state.rivalName = action.payload.name;
    },

    resetRival(state) {
      state.rivalSocketId = null;
      state.rivalUserId = null;
      state.rivalName = null;
    },
    setPlayerRole(state, action) {
      state.playerRole = action.payload;
    },
  },
});

export const { setRivalSocket, setRivalUser, resetRival, setPlayerRole } = matchSlice.actions;
export default matchSlice.reducer;
