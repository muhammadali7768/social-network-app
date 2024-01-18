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
export default function ChatWindow() {
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
  } = useChatStore();
  const user = useUserStore((state) => state.user);
  const [activeIndex, setActiveIndex] = useState(0);

  // const [messages, setMessages] = useState<IMessage[]>([]);
  const socket = initSocket();

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
    socket.on("messageReceivedByServer", (msgData: any) => {
      console.log("Message Received by Server",msgData);
    });
    return () => {
      socket.off("messageReceived");
    };
  },[socket]);

  //Here index is user id for Private messages and 0 for main chat
  const onChatChange = (index: number) => {
    setActiveIndex(index);
    if (index === 0) {
      setActiveChatMessages(mainChatMessages);
    } else if (index === user?.id) {
      //TODO: Enable sending messages to himeself
    } else {
      const activeChatUser = usersList.find((u) => u.id === index);
      console.log("Active User Chat", activeChatUser);
      setActiveChatMessages(activeChatUser?.messages || []);
    }
  };

  return (
    <main className={`flex min-h-screen flex-col items-center`}>
      <ChatWindowHeader />
      <div className="flex flex-col h-screen w-full gap-4 bg-slate-300 overflow-hidden">
        <div className="flex flex-row w-full h-screen bg-slate-100">
          {/* Contact List Starts */}
          <div className="basis-1/4 border  overflow-y-auto">
            <nav className="py-4 px-6 text-sm font-medium">
              <label>Contact List</label>
            </nav>
            <ContactList>
              <MainChatItem
                name="Main Chat"
                isActive={activeIndex === 0}
                onShow={() => onChatChange(0)}
              />
              {usersList &&
                usersList.map((user: IListUser) => {
                  return (
                    <ListItem
                      key={user.username}
                      user={user}
                      isActive={activeIndex === user.id}
                      onShow={() => onChatChange(user.id)}
                    />
                  );
                })}
            </ContactList>
          </div>{" "}
          {/* Contact List Ends */}
          <div className="basis-3/4 border">
            <div className="flex flex-col w-full h-screen bg-white">
              <div className="h-5/6">
                <MessageList key={activeIndex} messages={activeChatMessages} />
              </div>
              <div className="h-1/6 bg-slate-100 py-6">
                <ChatInput index={activeIndex} key={activeIndex} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
