import React from "react";
import ChatSidebar from "./comps/ChatSidebar";
import ChatMain from "./comps/ChatMain";

const Chat = () => {
  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* Sidebar */}
      <div className="w-[300px] border-r border-gray-300 bg-white">
        <ChatSidebar />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        <ChatMain />
      </div>
    </div>
  );
};

export default Chat;
