'use client';

import { useDispatch, useSelector } from 'react-redux';
import {
  setFriends,
  setPendingReceived,
  setPendingSent,
  addPendingSentRequest,
  removePendingReceivedRequest,
  addFriend,
} from '@/store/slices/friendshipSlice';
import {
  getFriends,
  getPendingReceivedRequests,
  getPendingSentRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from '@/lib/friendshipService';

export function useFriendship() {
  const dispatch = useDispatch();

  const friends = useSelector((state) => state.friendship.friends.data);
  const pendingReceived = useSelector((state) => state.friendship.pendingReceived.data);
  const pendingSent = useSelector((state) => state.friendship.pendingSent.data);

  const fetchFriends = async () => {
    const data = await getFriends();
    dispatch(setFriends(data));
  };

  const fetchPendingReceived = async () => {
    const data = await getPendingReceivedRequests();
    dispatch(setPendingReceived(data));
  };

  const fetchPendingSent = async () => {
    const data = await getPendingSentRequests();
    dispatch(setPendingSent(data));
  };

  const fetchAll = async () => {
    await fetchFriends();
    await fetchPendingReceived(); 
    await fetchPendingSent();
  };

  const sendRequest = async (receiverId) => {
    const newRequest = await sendFriendRequest(receiverId);
    dispatch(addPendingSentRequest(newRequest));
    await fetchAll();
  };

  const acceptRequest = async (requestId) => {
    await acceptFriendRequest(requestId);
    await fetchAll();
  };

  const rejectRequest = async (requestId) => {
    await rejectFriendRequest(requestId);
    dispatch(removePendingReceivedRequest(requestId));
  };

  return {
    friends,
    pendingReceived,
    pendingSent,
    fetchFriends,
    fetchPendingReceived,
    fetchPendingSent,
    fetchAll,
    sendRequest,
    acceptRequest,
    rejectRequest,
  };
}
