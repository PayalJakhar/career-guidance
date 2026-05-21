import React from "react";
import CareerChatbot from "@/components/career-chatbot";

const MainLayout = async ({ children }) => {
  return (
    <div className="container mx-auto mt-24 mb-20">
      {children}
      <CareerChatbot />
    </div>
  );
};

export default MainLayout;
