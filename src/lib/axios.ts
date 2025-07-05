import axios from "axios";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://tasksoldier.vercel.app/api/v1/",
  timeout: 10000,
});
