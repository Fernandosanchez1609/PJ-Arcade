import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    friends: {
        data: [],
    },
    pendingReceived: {
        data: [],
    },
    pendingSent: {
        data: [],
    },
    onlineStatus: {}
}

const friendshipSlice = createSlice({
    name: 'friendship',
    initialState,
    reducers: {

        setFriends: (state, action) => {
            state.friends.data = action.payload
        },

        setPendingReceived: (state, action) => {
            state.pendingReceived.data = action.payload
        },

        setPendingSent: (state, action) => {
            state.pendingSent.data = action.payload
        },

        setFriendOnline: (state, action) => {
            const userId = action.payload;
            state.onlineStatus[userId] = true;
        },

        setFriendOffline: (state, action) => {
            const userId = action.payload;
            state.onlineStatus[userId] = false;
        },

        addPendingSentRequest: (state, action) => {
            state.pendingSent.data.push(action.payload)
        },

        removePendingReceivedRequest: (state, action) => {
            state.pendingReceived.data = state.pendingReceived.data.filter(
                req => req.id !== action.payload
            )
        },

        addFriend: (state, action) => {
            state.friends.data.push(action.payload)
        }
    }
})

export const {
    setFriends,
    setPendingReceived,
    setPendingSent,
    setFriendOnline,
    setFriendOffline,
    addPendingSentRequest,
    removePendingReceivedRequest,
    addFriend,
} = friendshipSlice.actions

export default friendshipSlice.reducer
