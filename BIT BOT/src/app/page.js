"use client";
import "./globals.css";

import { useChat } from "ai/react";
import { useState, useEffect } from "react";
import { Bars } from "react-loader-spinner";
import Markdown from "markdown-to-jsx";

export default function Chat() {
  const [selectedOption, setSelectedOption] = useState("gemini-1.5-pro-latest");
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    reload,
    isLoading,
  } = useChat({
    experimental_prepareRequestBody: (pay_load) => {
      return {
        messages: pay_load.messages,
        selectedOption: selectedOption,
      };
    },
  });

  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
  };

  useEffect(() => {
    console.log(`Selected model: ${selectedOption}`);
  }, [selectedOption]);

  console.log(error);

  return (
    <div className="flex  py-24  stretch">
      <div className="flex-1  mb-16 mt-20">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`container ${m.role === "user" ? "user" : "assistant"}`}
          >
            <Markdown>{m.content}</Markdown>
          </div>
        ))}
        {error && (
          <>
            <div>An error occurred.</div>
            <button type="button" onClick={() => reload()}>
              Retry
            </button>
          </>
        )}
        {isLoading && (
          <div className="flex justify-center items-center my-4">
            <Bars color="black" height={30} width={30} />
          </div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 w-full max-w-md p-2 mb-8"
      >
        <input
          className="fixed-input w-full p-2 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
          aria-label="User input"
        />
      </form>
      <div className="header-container fixed top-0 left-0 w-full flex items-center justify-between p-2 bg-white z-50">
        <a className="logo" href="https://www.bitsathy.ac.in/">
          <img src="/logo.png" alt="logo" />
        </a>
        <h1>BIT BOT</h1>
        <div className="dropbox">
          <select
            id="dropbox"
            value={selectedOption}
            onChange={handleDropdownChange}
            aria-label="Select AI model"
          >
            <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro Latest</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
          </select>
        </div>
      </div>
    </div>
  );
}
