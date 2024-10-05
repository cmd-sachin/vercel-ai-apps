"use client";
import React, { useState } from "react";

function useObject({ api }) {
  const [isLoading, setIsLoading] = useState(false);
  const [object, setObject] = useState(null);
  const [error, setError] = useState(null);

  const submit = async (message) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [message] }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log("Raw response:", responseText); // Added for debugging

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid response from server");
      }

      console.log("Parsed data:", data); // Added for debugging

      if (data && data.roadmap) {
        setObject(data.roadmap);
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Unexpected response format from server");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, object, error, submit };
}

export default function RoadMapGenerator() {
  const { isLoading, object, error, submit } = useObject({
    api: "/api/chat",
  });
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      submit(`Generate a roadmap for becoming ${input}`);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">RoadMap Generator</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter the profession (e.g., Data Analyst, Nurse ...)"
          className="w-full p-2 border border-gray-300 rounded mb-2"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full relative"
        >
          {isLoading ? (
            <>
              <span className="opacity-0">Generate RoadMap</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            </>
          ) : (
            "Generate RoadMap"
          )}
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {object ? (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h3 className="text-xl font-semibold mb-2">
            {object.profession || "Unnamed Profession"}
          </h3>
          <h4 className="font-bold mt-4 mb-2">To Learn:</h4>
          <ul className="list-disc pl-5 mb-4">
            {object.to_learn && object.to_learn.length > 0 ? (
              object.to_learn.map((item, index) => (
                <li key={index} className="mb-1">
                  {item}
                </li>
              ))
            ) : (
              <li>Nothing to Learn</li>
            )}
          </ul>
          <h4 className="font-bold mt-4 mb-2">Educational Qualifications:</h4>
          <ol className="list-decimal pl-5">
            {object.education && object.education.length > 0 ? (
              object.education.map((item, index) => (
                <li key={index} className="mb-2">
                  {item}
                </li>
              ))
            ) : (
              <li>No Educational Qualification Needed</li>
            )}
          </ol>

          <h4 className="font-bold mt-4 mb-2">Expected Salary:</h4>
          <p className="mb-2">{object.expected_salary}</p>
        </div>
      ) : (
        <p className="text-gray-600">
          No roadmap generated yet. Enter a profession and click 'Generate
          RoadMap'!
        </p>
      )}
    </div>
  );
}
