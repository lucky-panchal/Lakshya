import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

export const uploadFile = (file) => {
  const form = new FormData();
  form.append("file", file);
  return API.post("/upload/file", form);
};

export const uploadURL = (url) => {
  const form = new FormData();
  form.append("url", url);
  return API.post("/upload/url", form);
};

export const checkFile = (file, mode = "tfidf") => {
  const form = new FormData();
  form.append("file", file);
  form.append("mode", mode);
  return API.post("/check/file", form);
};

export const checkURL = (url, mode = "tfidf") => {
  const form = new FormData();
  form.append("url", url);
  form.append("mode", mode);
  return API.post("/check/url", form);
};

export const checkText = (text, mode = "tfidf") => {
  const form = new FormData();
  form.append("text", text);
  form.append("mode", mode);
  return API.post("/check/text", form);
};

export const getCorpus = () => API.get("/corpus/");
export const deleteCorpusDoc = (id) => API.delete(`/corpus/${id}`);
export const getResults = () => API.get("/check/results");
export const deleteResult = (id) => API.delete(`/check/results/${id}`);
export const clearAllResults = () => API.delete("/check/results/clear");
