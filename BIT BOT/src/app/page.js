"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import Markdown from "markdown-to-jsx";
import { Send, Loader2, AlertCircle } from "lucide-react";

const ChatMessage = ({ message }) => (
  <div
    className={`flex ${
      message.role === "user" ? "justify-end" : "justify-start"
    } mb-4`}
  >
    <div
      className={`max-w-[70%] p-4 rounded-xl shadow-md ${
        message.role === "user"
          ? "bg-blue-500 text-white ml-auto"
          : "bg-white text-gray-800 mr-auto"
      }`}
    >
      <Markdown className="prose prose-sm max-w-none">
        {message.content}
      </Markdown>
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex items-center space-x-2 mb-4">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
    <div
      className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
      style={{ animationDelay: "0.2s" }}
    ></div>
    <div
      className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
      style={{ animationDelay: "0.4s" }}
    ></div>
  </div>
);

export default function Chat() {
  const [selectedOption, setSelectedOption] = useState("gemini-1.5-pro-latest");
  const [displayError, setDisplayError] = useState(null);
  const messagesEndRef = useRef(null);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    reload,
    isLoading,
  } = useChat({
    experimental_prepareRequestBody: (payload) => ({
      messages: payload.messages,
      selectedOption: selectedOption,
    }),
    onError: (error) => {
      console.error("Chat error:", error);
      setDisplayError(
        error.message
      );
    },
    onResponse: (response)=>{
      console.log("Response  " + response)
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, displayError]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      setDisplayError(null);
      try {
        await handleSubmit(e);
      } catch (error) {
        console.error("Submission error:", error);
        setDisplayError(
          error.message || "An error occurred while sending your message."
        );
      }
    }
  };
  

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src="/logo.png" alt="BIT logo" className="h-12 w-auto" />
          <h1 className="text-3xl font-bold text-gray-800">BIT BOT</h1>
        </div>
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
        >
          <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro Latest</option>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
          <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
        </select>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-100 to-gray-200">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {isLoading && <TypingIndicator />}
        {displayError && (
          <div
            className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50"
            role="alert"
          >
            <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-3" />
            <span className="sr-only">Error</span>
            <div>
              <span className="font-medium">Error:</span> {displayError}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleFormSubmit}
        className="p-4 bg-white border-t border-gray-200"
      >
        <div className="flex space-x-4 items-center">
          <input
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me anything about BIT..."
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold p-3 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
