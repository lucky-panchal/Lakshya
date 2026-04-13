import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api",
  timeout: 60000, // 60s timeout for BERT requests
});

// Global error interceptor — maps backend errors to friendly messages
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const detail = err.response?.data?.detail;

    if (!err.response) {
      err.friendlyMessage = "Cannot reach the server. Make sure the backend is running.";
    } else if (status === 400 && detail?.includes("Corpus is empty")) {
      err.friendlyMessage = "Your corpus is empty. Please upload documents first.";
    } else if (status === 400 && detail?.includes("URL")) {
      err.friendlyMessage = "Could not fetch that URL. It may be blocked or unavailable.";
    } else if (status === 413) {
      err.friendlyMessage = "File is too large. Please upload a file under 10MB.";
    } else if (status === 404) {
      err.friendlyMessage = "Resource not found.";
    } else if (status === 500) {
      err.friendlyMessage = "Server error. Please try again in a moment.";
    } else {
      err.friendlyMessage = detail || "Something went wrong. Please try again.";
    }

    return Promise.reject(err);
  }
);

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

export const checkFile = (file, mode = "tfidf", includeAcademic = false) => {
  const form = new FormData();
  form.append("file", file);
  form.append("mode", mode);
  form.append("include_academic", includeAcademic);
  return API.post("/check/file", form);
};

export const checkURL = (url, mode = "tfidf", includeAcademic = false) => {
  const form = new FormData();
  form.append("url", url);
  form.append("mode", mode);
  form.append("include_academic", includeAcademic);
  return API.post("/check/url", form);
};

export const checkText = (text, mode = "tfidf", includeAcademic = false) => {
  const form = new FormData();
  form.append("text", text);
  form.append("mode", mode);
  form.append("include_academic", includeAcademic);
  return API.post("/check/text", form);
};

export const checkAcademic = (text) => {
  const form = new FormData();
  form.append("text", text);
  return API.post("/check/academic", form);
};

export const getCorpus       = ()    => API.get("/corpus/");
export const deleteCorpusDoc = (id)  => API.delete(`/corpus/${id}`);
export const getResults      = ()    => API.get("/check/results");
export const deleteResult    = (id)  => API.delete(`/check/results/${id}`);
export const clearAllResults = ()    => API.delete("/check/results/clear");

export const highlightText = (text, corpusId, threshold = 0.5) => {
  const form = new FormData();
  form.append("text", text);
  form.append("corpus_id", corpusId);
  form.append("threshold", threshold);
  return API.post("/check/highlight", form);
};

export const highlightFile = (file, corpusId, threshold = 0.5) => {
  const form = new FormData();
  form.append("file", file);
  form.append("corpus_id", corpusId);
  form.append("threshold", threshold);
  return API.post("/check/highlight/file", form);
};
