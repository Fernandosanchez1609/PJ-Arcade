import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [] 
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addChatMessage(state, action) {
      state.messages.push(action.payload);
    },
    resetChat(state) {
      state.messages = [];
    },
  },
});

export const { addChatMessage, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
