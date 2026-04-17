// "use client";

// import { useState } from "react";
// import { careerChat } from "@/actions/careerChatbot";
// import { MessageCircle, X } from "lucide-react";

// export default function CareerChatbot() {
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function sendMessage() {
//     if (!input.trim()) return;

//     const userMsg = { role: "user", text: input };
//     setMessages(prev => [...prev, userMsg]);
//     setInput("");
//     setLoading(true);

//     const reply = await careerChat(input);

//     setMessages(prev => [
//       ...prev,
//       userMsg,
//       { role: "ai", text: reply }
//     ]);

//     setLoading(false);
//   }

//   return (
//     <>
//       {/* Floating Button */}
//       <button
//         onClick={() => setOpen(true)}
//         className="fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-lg"
//       >
//         <MessageCircle />
//       </button>

//       {/* Chat Window */}
//       {open && (
//         <div className="fixed bottom-20 right-6 w-80 h-96 bg-background border rounded-xl shadow-xl z-50 flex flex-col">
          
//           <div className="p-3 border-b flex justify-between items-center">
//             <span className="font-semibold">Career AI</span>
//             <button onClick={() => setOpen(false)}>
//               <X />
//             </button>
//           </div>

//           <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
//             {messages.map((m, i) => (
//               <div
//                 key={i}
//                 className={`p-2 rounded-lg ${
//                   m.role === "user"
//                     ? "bg-primary text-white ml-auto w-fit"
//                     : "bg-muted"
//                 }`}
//               >
//                 {m.text}
//               </div>
//             ))}
//             {loading && <p>Thinking...</p>}
//           </div>

//           <div className="p-3 border-t flex gap-2">
//             <input
//               value={input}
//               onChange={e => setInput(e.target.value)}
//               className="flex-1 border rounded px-2 py-1"
//               placeholder="Ask about your career..."
//             />
//             <button onClick={sendMessage} className="text-primary">
//               Send
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// "use client";

// import { useState } from "react";
// import { careerChat } from "@/actions/careerChatbot";
// import { MessageCircle, X } from "lucide-react";

// const greetings = [
//   "hi",
//   "hello",
//   "hey",
//   "good morning",
//   "good evening",
//   "good afternoon"
// ];

// export default function CareerChatbot() {
//   const [open, setOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     {
//       role: "ai",
//       text: "Hi 👋 I’m your AI Career Coach"
//     }
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);

//   async function sendMessage() {
//     if (!input.trim()) return;

//     const userText = input;
//     setInput("");

//     setMessages(prev => [
//       ...prev,
//       { role: "user", text: userText }
//     ]);

//     setLoading(true);

//     const lower = userText.toLowerCase().trim();

//     // greeting handler
//     if (greetings.includes(lower)) {
//       setMessages(prev => [
//         ...prev,
//         {
//           role: "ai",
//           text:
//             "Hi 👋 How may I help you ?"
//         }
//       ]);
//       setLoading(false);
//       return;
//     }

//     const reply = await careerChat(userText);

//     setMessages(prev => [
//       ...prev,
//       { role: "ai", text: reply }
//     ]);

//     setLoading(false);
//   }

//   return (
//     <>
//       {/* FLOATING TEXT */}
//       {!open && (
//         <div className="fixed bottom-24 right-6 z-40 animate-bounce">
//           <div className="bg-primary text-white px-3 py-1 rounded-full text-xs shadow-lg">
//             Wanna Chat
//           </div>
//         </div>
//       )}

//       {/* FLOATING BUTTON */}
//       <button
//         onClick={() => setOpen(true)}
//         className="
//           fixed bottom-6 right-6 z-50
//           bg-primary text-white
//           p-4 rounded-full
//           shadow-xl
//           hover:scale-110
//           transition-transform
//         "
//       >
//         <MessageCircle className="w-6 h-6" />
//       </button>

//       {/* CHAT WINDOW */}
//       {open && (
//         <div className="fixed bottom-20 right-6 w-80 h-96 bg-background border rounded-xl shadow-xl z-50 flex flex-col">

//           {/* HEADER */}
//           <div className="p-3 border-b flex justify-between items-center">
//             <span className="font-semibold">Career AI</span>
//             <button onClick={() => setOpen(false)}>
//               <X />
//             </button>
//           </div>

//           {/* MESSAGES */}
//           <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
//             {messages.map((m, i) => (
//               <div
//                 key={i}
//                 className={`p-2 rounded-lg max-w-[90%] whitespace-pre-line ${
//                   m.role === "user"
//                     ? "bg-primary text-white ml-auto"
//                     : "bg-muted text-black"
//                 }`}
//               >
//                 {m.text}
//               </div>
//             ))}

//             {loading && (
//               <div className="text-xs text-muted-foreground">
//                 Typing...
//               </div>
//             )}
//           </div>

//           {/* INPUT */}
//           <div className="p-3 border-t flex gap-2">
//             <input
//               value={input}
//               onChange={e => setInput(e.target.value)}
//               className="flex-1 border rounded px-2 py-1 text-sm text-white"
//               placeholder="Ask about your career..."
//               onKeyDown={e => e.key === "Enter" && sendMessage()}
//             />
//             <button
//               onClick={sendMessage}
//               className="text-primary font-medium"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

"use client";

import { useState } from "react";
import Image from "next/image";
import { careerChat } from "@/actions/careerChatbot";
import { X } from "lucide-react";

const greetings = [
  "hi",
  "hello",
  "hey",
  "good morning",
  "good evening",
  "good afternoon"
];

export default function CareerChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi 👋 I’m your AI Career Coach"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    const lower = userText.toLowerCase().trim();

    if (greetings.includes(lower)) {
      setMessages(prev => [
        ...prev,
        { role: "ai", text: "Hi 😊 How may I help you with your career?" }
      ]);
      setLoading(false);
      return;
    }

    const reply = await careerChat(userText);

    setMessages(prev => [...prev, { role: "ai", text: reply }]);
    setLoading(false);
  }

  return (
    <>
      {/* FLOATING TEXT */}
      {!open && (
        <div className="fixed bottom-24 right-8 z-40 animate-bounce">
          <div className="bg-primary text-white px-3 py-1 rounded-full text-xs shadow-lg">
            Wanna chat
          </div>
        </div>
      )}

      {/* FLOATING BOT ICON */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-6 right-6 z-50
          w-16 h-16 rounded-full
          bg-white shadow-2xl
          flex items-center justify-center
          animate-floaty
          hover:scale-110
          transition-transform
        "
      >
        <Image
          src="/bot.webp"
          alt="Chat bot"
          width={50}
          height={50}
          className="rounded-full"
        />
      </button>

      {/* CHAT WINDOW */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-[420px] bg-[#eaf4ff] border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="bg-primary text-white p-3 flex justify-between items-center">
            <div>
              <p className="font-semibold">Career Bot</p>
              <p className="text-xs opacity-80">Online</p>
            </div>
            <button onClick={() => setOpen(false)}>
              <X />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm chat-scroll">

            {messages.map((m, i) => (
              <div
                key={i}
                className={`px-3 py-2 rounded-2xl max-w-[85%] whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-primary text-white ml-auto rounded-br-none"
                    : "bg-white text-black rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="text-xs text-gray-500">
                Typing...
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="p-3 bg-white border-t flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="
                flex-1
                bg-primary
                text-white
                placeholder:text-white/70
                rounded-full
                px-4 py-2
                text-sm
                outline-none
              "
              placeholder="Type your message..."
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-primary text-white px-4 py-2 rounded-full text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
