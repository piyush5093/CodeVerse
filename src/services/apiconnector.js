
import axios from "axios";

// 🔥 Create Axios Instance with Backend Base URL
export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1",  // Backend server
  withCredentials: true,                   // Needed if using auth cookies
});

// 🔥 Generic API Connector
export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method: method,
    url: url,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
  });
};

