import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  mongoUri: process.env.MONGO_URI || "",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};