import React, { useState } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";

type ChatMessage = {
  id: string;
  text: string;
  timestamp: Date;
  type: "user" | "assistant";
};

const FloatingChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: 'Hello! I\'m your SmartFinance AI Assistant. You can tell me about your transactions in natural language like "Meh nay Meezan Bank sy 2500 lia hai" or "5000 deposit kia HBL may".',
      timestamp: new Date(),
      type: "assistant",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      timestamp: new Date(),
      type: "user",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    // Simulate assistant response after a brief delay
    setTimeout(() => {
      const assistantResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `I understand you want to record a transaction: "${inputText}". Let me process this for you...`,
        timestamp: new Date(),
        type: "assistant",
      };
      setMessages((prev) => [...prev, assistantResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
          isOpen ? "scale-0" : "scale-100"
        }`}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 rounded-t-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  SmartFinance AI Assistant
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col justify-start items-start">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.type === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm"
                  }`}
                >
                  <p>{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === "user"
                        ? "text-blue-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your transaction... e.g., 'Meh nay Meezan Bank sy 2500 lia hai'"
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default FloatingChatAssistant;
