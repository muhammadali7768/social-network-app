import { useEffect, useCallback } from "react";
import useUserStore from "@/hooks/useUserStore";
import useChatStore from "@/hooks/useChatStore";
import { IListUser } from "@/interfaces/auth.interfaces";
import { initSocket } from "@/config/socketio";
import { IMessage } from "@/interfaces/message.interface";

import { getNewTokenByRefreshToken } from "@/config/axios";

export const useChatEffects = () => {
  const socket = initSocket();

  const usersList = useUserStore((state) => state.usersList);
  const setUsersList = useUserStore((state) => state.setUsersList);
  const updateUserMessages = useUserStore((state) => state.updateUserMessages);
  const updateMessage = useUserStore((state) => state.updateMessage);
  const {
    setActiveChatMessages,
    setMainChatMessages,
    updateActiveChatMessages,
    updateMainChatMessages,
    updateMainMessage,
    mainChatMessages,
    activeChatIndex
  } = useChatStore();
  const user = useUserStore((state) => state.user);
  const updateOrAddUser = useCallback(
    (userId: number, status: string, user?: IListUser) => {
      const userExist = usersList.find((user) => user.id === userId);
      if (userExist) {
        setUsersList(
          //Update existing user status
          usersList.map((oldUser) => {
            if (oldUser.id === userExist.id) {
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
    socket.connect();
    socket.on("connect", () => {
      socket.emit("subscribe", "chat");
    });

    socket.on("connect_error", async (err) => {
      if (err.message === "invalid token") {
        const response = await getNewTokenByRefreshToken();
        if (response.status === 201) {
          setTimeout(() => {
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
      setUsersList(users);
    });

    return () => {
      socket.off("users");
    };
  }, [socket, setUsersList]);

  const setChatMessages = useCallback(
    async (message: IMessage) => {
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
      updateOrAddUser(user.id, "online", user);
    });
    return () => {
      socket.off("userConnected");
    };
  }, [socket, updateOrAddUser]);

  useEffect(() => {
    socket.on("userDisconnected", (userId: number) => {
      updateOrAddUser(userId, "offline");
    });
    return () => {
      socket.off("userDisconnected");
    };
  }, [socket, updateOrAddUser]);

  useEffect(() => {
    socket.on("pmMessageReceivedByServer", (msgData: any) => {
      const { messageId, messageClientId, recipientId } = msgData;
      updateMessage(messageId, messageClientId, recipientId);
      if (activeChatIndex > 0) {
        const userMessages = usersList.find((u) => u.id === activeChatIndex);
        console.log("Active chat user", userMessages)
        setActiveChatMessages(userMessages?.messages || []);
      }
    });
    socket.on("mMessageReceivedByServer", async(msgData: any) => {
      await updateMainMessage(msgData.messageId, msgData.messageClientId);
      if (activeChatIndex === 0) {
        console.log("Main Chat message", mainChatMessages)
        setActiveChatMessages(mainChatMessages);
      }
    });
    return () => {
      socket.off("pmMessageReceivedByServer");
      socket.off("mMessageReceivedByServer");
    };
  }, [
    socket,
    updateMainMessage,
    updateMessage,
    activeChatIndex,
    mainChatMessages,
    setActiveChatMessages,
    usersList,
  ]);
};
