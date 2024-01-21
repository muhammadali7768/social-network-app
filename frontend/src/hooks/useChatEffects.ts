import ChatInput from "@/components/chat/ChatInput";
import ListItem from "@/components/chat/ContactItem";
import ContactList from "@/components/chat/ContactList";
import MessageList from "@/components/chat/MessageList";
import ChatWindowHeader from "@/components/layout/ChatWindowHeader";
import { useEffect, useState, useCallback } from "react";
import useUserStore from "@/hooks/useUserStore";
import useChatStore from "@/hooks/useChatStore";
import { IListUser } from "@/interfaces/auth.interfaces";
import { initSocket } from "@/config/socketio";
import { IMessage } from "@/interfaces/message.interface";
import MainChatItem from "@/components/chat/MainChatItem";
import NavigateService from "@/services/navigate";
import { getNewTokenByRefreshToken } from "@/config/axios";

export const useChatEffects = () => {
  const socket = initSocket();

  const usersList = useUserStore((state) => state.usersList);
  const setUsersList = useUserStore((state) => state.setUsersList);
  const updateUserMessages = useUserStore((state) => state.updateUserMessages);
  const {
    mainChatMessages,
    activeChatMessages,
    setActiveChatMessages,
    setMainChatMessages,
    updateActiveChatMessages,
    updateMainChatMessages,
    updateMainMessage,
    updatePrivateMessage,
  } = useChatStore();
  const user = useUserStore((state) => state.user);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateOrAddUser = useCallback(
    (userId: number, status: string, user?: IListUser) => {
      const userExist = usersList.find((user) => user.id === userId);
      if (userExist) {
        setUsersList(
          //Update existing user status
          usersList.map((oldUser) => {
            if (oldUser.id === userExist.id) {
              console.log("user exists", userExist, status);
              return { ...oldUser, status: status };
            } else return oldUser;
          })
        );
      } else if (user) {
        setUsersList([...usersList, user]);
      }
    },
    [setUsersList, usersList]
  );

  useEffect(() => {
    console.log("Connecting to socket", user);
    socket.connect();
    socket.on("connect", () => {
      console.log("Connected to Socket.IO");
      socket.emit("subscribe", "chat");
      console.log("Socket ID", socket.id);
    });

    socket.on("connect_error", async (err) => {
      console.log("Socket Connection Error");
      if (err.message === "invalid token") {
        const response = await getNewTokenByRefreshToken();
        // console.log("RefreshTokens", response);
        if (response.status === 201) {
          setTimeout(() => {
            console.log("RECONNECTING>>>>>>");
            socket.connect();
          }, 1000);
        } //else  if(response.status===401){
        //   NavigateService.navigate("/")
        // }
      }
    });

    return () => {
      socket.disconnect();
      socket.off("connect_error");
    };
  }, [socket, user]);

  useEffect(() => {
    socket.on("users", (users: IListUser[]) => {
      console.log("online Users");
      setUsersList(users);
    });

    return () => {
      socket.off("users");
    };
  }, [socket, setUsersList]);

  const setChatMessages = useCallback(
    async (message: IMessage) => {
        console.log("Message received",message)
      if (!message.recipientId || message.recipientId === 0) {
        updateMainChatMessages(message);
      } else if (message.recipientId && message.recipientId > 0) {
        const msgConcernedUserId =
          user?.id === message.senderId
            ? message.recipientId
            : message.senderId;
        const msgUser = await usersList.find(
          (usr) => usr.id === msgConcernedUserId
        );
        if (msgUser) updateUserMessages(msgUser.id, message);
      }
      updateActiveChatMessages(message);
    },
    [
      updateActiveChatMessages,
      usersList,
      updateMainChatMessages,
      updateUserMessages,
      user,
    ]
  );
  useEffect(() => {
    const setMessageHistory = (messageHistory: IMessage[]) => {
      console.log("Message History got");
      if (messageHistory) {
        setMainChatMessages(messageHistory);
        setActiveChatMessages(messageHistory);
      }
    };

    socket.on("messageHistory", setMessageHistory);

    socket.on("message", setChatMessages);

    return () => {
      socket.off("message", setChatMessages);
    };
  }, [socket, setMainChatMessages, setChatMessages, setActiveChatMessages]);

  useEffect(() => {
    socket.on("userConnected", (user: IListUser) => {
      console.log("New User Connected", user);
      updateOrAddUser(user.id, "online", user);
    });
    return () => {
      socket.off("userConnected");
    };
  }, [socket, updateOrAddUser]);

  useEffect(() => {
    socket.on("userDisconnected", (userId: number) => {
      console.log("User disconnected", userId);
      updateOrAddUser(userId, "offline");
    });
    return () => {
      socket.off("userDisconnected");
    };
  }, [socket, updateOrAddUser]);

  useEffect(() => {
    socket.on("pmMessageReceivedByServer", (msgData: any) => {
      const { messageId, messageClientId, receipientId } = msgData;
      console.log("Message Received by Server", msgData);
      updatePrivateMessage(messageId, messageClientId, receipientId);
    });
    socket.on("mMessageReceivedByServer", (msgData: any) => {
      console.log("Message Received by Server", msgData);
      updateMainMessage(msgData.messageId, msgData.messageClientId);
    });
    return () => {
      socket.off("pmMessageReceivedByServer");
      socket.off("mMessageReceivedByServer");
    };
  }, [socket, updateMainMessage, updatePrivateMessage]);
};
