import ChatInput from "@/components/chat/ChatInput";
import ListItem from "@/components/chat/ContactItem";
import ContactList from "@/components/chat/ContactList";
import MessageList from "@/components/chat/MessageList";
import ChatWindowHeader from "@/components/layout/ChatWindowHeader";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import useUserStore from "@/hooks/useUserStore";
import { IListUser } from "@/interfaces/auth.interfaces";
import { initSocket } from "@/config/socketio";
import { IMessage } from "@/interfaces/message.interface";
export default function ChatWindow() {
  const usersList = useUserStore((state) => state.usersList);
  const setUsersList = useUserStore((state) => state.setUsersList);
  const user = useUserStore((state) => state.user);

  const [messages, setMessages] = useState<IMessage[]>([]);
  const socket = initSocket();

  const [isGetUsersList, setIsGetUsersList] = useState(false);
  const [isConnected, setIsConnected]=useState(false)
 

  const updateOrAddUser = useCallback(
    (userId: number, status: string, user?: IListUser) => {
      const userExist = usersList.find((user) => user.id === userId);
      if (userExist) {
        setUsersList(
          //Update existing user status
          usersList.map((oldUser) => {
            if (oldUser.id === userExist.id) {
              console.log("user exists", userExist, status)
              return { ...oldUser, status: status };
            } else return oldUser;
          })
        );
      } else if (user) {
        setUsersList([...usersList, user]);
      }
    },[setUsersList, usersList]
  );

  // useEffect(() => {
  //   if (!isGetUsersList && isConnected) {
  //     getOnlineUsers();
  //     setIsGetUsersList(true);
  //   }
  // }, [getOnlineUsers, isGetUsersList, isConnected]);

  useEffect(() => {
    console.log("Connecting to socket", user);
    socket.auth = { token: user?.accessToken };
    socket.connect();
    socket.on("connect", () => {
      console.log("Connected to Socket.IO");
      socket.emit("subscribe", "chat");
      setIsConnected(true) 

      console.log("Socket ID", socket.id)     
    });
    socket.on("connect_error", (err) => {
      if (err.message === "invalid token") {
        alert("Connection Error while connecting to chat");
      }
    });

    socket.on("users", (users:IListUser[])=>{
      console.log("online Users")
      setUsersList(users);
    })
    
    return () => {
      socket.disconnect();
      socket.off("connect_error");
    };
  }, [socket, user, setUsersList]);
  useEffect(() => {
    const setMainMessages = (message: IMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const setMessageHistory = (messageHistory: IMessage[]) => {
       if (messageHistory) {
        setMessages(messageHistory);
      }
    };

    socket.on("messageHistory", setMessageHistory);

    socket.on("message", setMainMessages);

    return () => {
      socket.off("message", setMainMessages);
    };
  }, [socket]);

  useEffect(() => {
    socket.on("userConnected", (user: IListUser) => {
      console.log("New User Connected", user)
     updateOrAddUser(user.id, 'online', user)
    });

    socket.on("userDisconnected", (userId: number) => {
      console.log("User disconnected",userId)
      updateOrAddUser(userId, "offline");
    });

    socket.io.on("reconnect",()=>{
      console.log("RECONNECTING>>>>>>>>>>>>>>>>>>>>>>")
    })
    return () => {
      socket.off("userDisconnected");
      socket.off("userConnected");
    };
  }, [socket, usersList, setUsersList, updateOrAddUser]);

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
              {usersList &&
                usersList.map((user: IListUser) => {
                  return <ListItem key={user.username} {...user} />;
                })}
            </ContactList>
          </div>{" "}
          {/* Contact List Ends */}
          <div className="basis-3/4 border">
            <div className="flex flex-col w-full h-screen bg-white">
              <div className="h-5/6">
                <MessageList messages={messages} />
              </div>
              <div className="h-1/6 bg-slate-100 py-6">
                <ChatInput />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
