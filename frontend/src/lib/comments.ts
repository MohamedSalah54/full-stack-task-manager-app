import axios from "@/lib/api";

export const fetchCommentsByTask = async (taskId: string) => {
  const response = await axios.get(`/comments/${taskId}`);
  return response.data;
};

export const createComment = async (text: string, taskId: string) => {
  const response = await axios.post("/comments", { text, taskId });
  return response.data;
};

export const updateComment = async (id: string, text: string) => {
  const response = await axios.patch(`/comments/${id}`, { text });
  return response.data;
};

export const deleteComment = async (id: string) => {
  const response = await axios.delete(`/comments/${id}`);
  return response.data;
};

