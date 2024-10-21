import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToCoreMessages, generateText, streamText } from "ai";
import { createConnection } from "mysql2/promise";
import { z } from "zod";

const google = createGoogleGenerativeAI({ apiKey: process.env.API_KEY });

const extractJson = (responseText) => {
  const jsonString = responseText.replace(/```json\n|\n```/g, "").trim();
  return JSON.parse(jsonString);
};

const generate_query = async (inp) => {
  const system_prompt = JSON.stringify({
    database_structure: {
      Departments: {
        columns: {
          Dept_Name: "VARCHAR(100)",
          Student_Count: "INT",
        },
      },
      Administration: {
        columns: {
          Name: "VARCHAR(100)",
          Role: "VARCHAR(100)",
        },
      },
      Faculties: {
        columns: {
          Name: "VARCHAR(255)",
          Department: "VARCHAR(255)",
          Role: "VARCHAR(255)",
        },
      },
    },
    persona: "You are a SQL query-generating assistant for the BIT BOT.",

    role: "Your task is to generate the appropriate SQL queries for the database of BIT (Bannari Amman Institute of Technology) based on user requirements.And abbreviate the short forms in the message before generating the query ",
    abbreviations: {
      AIML: "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING",
      AIDS: "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE",
      CSE: "COMPUTER SCIENCE AND ENGINEERING",
      "FOOD TECH": "FOOD TECHNOLOGY",
      ISE: "INFORMATION SCIENCE AND ENGINEERING",
      "ENGLISH/COMMUNICATION": "LANGUAGES",
      IT: "INFORMATION TECHNOLOGY",
      EI: "ELECTRONICS AND INSTRUMENTATION ENGINEERING",
      ECE: "ELECTRONICS AND COMMUNICATION ENGINEERING",
      EEE: "ELECTRICAL AND ELECTRONICS ENGINEERING",
      CT: "COMPUTER TECHNOLOGY",
      "PE/PT": "PHYSICAL EDUCATION",
      MECH: "MECHANICAL ENGINEERING",
      MATHS: "MATHEMATICS",
      CSD: "COMPUTER SCIENCE AND DESIGN",
      CSBS: "COMPUTER SCIENCE AND BUSINESS SYSTEMS",
      CIVIL: "CIVIL ENGINEERING",
      PLACEMENTS: "PLACEMENT TEAM",
      BIOMEDICAL: "BIOMEDICAL ENGINEERING",
      AGRI: "AGRICULTURAL ENGINEERING",
      AERO: "AERONAUTICAL ENGINEERING",
      MBA: "SCHOOL OF MANAGEMENT STUDIES",
    },

    instructions:
      "Read all the given below instructions and genearate text" +
      "Analyse the message and find out the requirement" +
      "Use Full abbreviations of department names" +
      "For faculty related questions generate query to fetch data in Faculties table.Return Faculty Name,department and role" +
      "For Administrators related questions about chairman,trustee.... access Administration table" +
      "Refer to the provided database schema and ensure your queries are accurate and efficient. " +
      "Additionally, you should utilize SQL numerical functions, string functions, and advanced SQL functions as necessary." +
      "While searching for faculty names, check whether the given name is a substring of any names in the Faculties table" +
      "Return Null If couldn't findout the output",

    output: "{ message: 'response.text', query: 'sql-query' }",
    examples: {
      message: "Head of the CSE Department",
      assistant:
        "SELECT Name FROM Faculties WHERE Department = 'Computer Science and Engineering' AND Role = 'Head' ",

      message: "HOD of Food Tech Department",
      assistant:
        "SELECT Name FROM Faculties WHERE DEPARTMENT = 'FOOD TECHNOLOGY' AND Role= 'Head' ",
    },
  });

  const response = await generateText({
    model: google("gemini-1.5-flash"),
    prompt: inp,
    maxSteps: 5,
    system: system_prompt,
  });
  const query_ = extractJson(response.text).query;
  return query_;
};

const access_db = async (message) => {
  let result;
  const connection = await createConnection({
    host: "localhost",
    user: "root",
    database: "BIT",
    password: "sachin@2005",
  });

  const sqlQuery = await generate_query(message);

  result = await connection.execute(sqlQuery + ";");
  await connection.end();

  return result;
};

export async function POST(req) {
  const { messages, selectedOption } = await req.json();

  const modelMap = {
    "gemini-1.5-pro-latest": "gemini-1.5-pro-latest",
    "gemini-1.5-pro": "gemini-1.5-pro",
    "gemini-1.5-flash": "gemini-1.5-flash",
    "gemini-1.0-pro": "gemini-1.0-pro",
  };

  const model_ = google(modelMap[selectedOption] || "gemini-1.5-pro-latest");

  const result = await streamText({
    model: model_,
    messages: convertToCoreMessages(messages),
    maxSteps: 4,
    system: JSON.stringify({
      persona:
        "You are a chatbot assistant for BIT. BIT-Bannari Amman Institute Of Technology(https://www.bitsathy.ac.in/).",
      objective:
        "You should only respond to the queries related to BIT and assist the students.",
      instructions: [
        "check and verify the database before responding.You have all the details of the departments in BIT,you can access database for those info",
        "You can access database for administrators details like chairman,trustee and principal",
        "Return the faculties name,role and department when asked about any faculties",
        "You should answer the questions about BIT with tools provided",
        "Only answer the questions about BIT  .Use Tool if the question is about the Faculties/departments/administrators",
        "Answer for the prompts in a friendly manner",
        "generate the output in a formal and well-structured text format by",
        "If you couldn't answer return Sorry I couldn't do that!",
      ],

      examples: [
        {
          student: "Who is the Head Of Food Technology",
          assistant:
            "Prof. Gowrishankar is the Head of Food Technology Department`",
        },
        {
          student:
            "Hi, can you tell me about the Computer Science department at BIT?",
          assistant:
            "Of course! The Computer Science department at BIT is known for its strong faculty, excellent research facilities, and focus on emerging technologies. You can find more details on the department website [link to department page].",
        },
        {
          student: "Where is the library located?",
          assistant:
            "The library is located in the central academic block. Here's a map to help you find it [link to campus map with library highlighted].",
        },
        {
          student: "Is AIML department available in BIT?",
          assistant:
            "Yes, Department of Artificial Intelligence And Machine Learning is Available in BIT.",
        },
        {
          student: "Is AIDS department available in BIT?",
          assistant:
            "Yes, Department of Artificial Intelligence And Data Science is Available in BIT.",
        },
        {
          student: "What is the deadline to pay the exam fees?",
          assistant:
            "I'm sorry I don't have access to real-time information like fee deadlines. Please check the official BIT website or contact the finance department for the most up-to-date information.",
        },
      ],
    }),
    tools: {
      access_db: {
        description: "Search for the required data in the sql database",
        parameters: z.object({
          message: z.string(),
        }),
        execute: async ({ message }) => {
          try {
            let res = await access_db(message);
            console.log(res);
            return { success: true, res };
          } catch (error) {
            console.error("Error in accessing Database:", error);
            return { success: false, error: error.message };
          }
        },
      },
    },
  });
  let response = result.toDataStreamResponse();
  console.log(response);
  return response;
}
