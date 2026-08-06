import API from "./client";

export const contactApi = {
  send: (data: { name: string; email: string; subject: string; message: string }) =>
    API.post("/contact", data),
};
