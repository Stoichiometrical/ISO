

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { readString } from "react-papaparse";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const API_1 = "http://127.0.0.1:5000";  //segmentation
export const API_2 = "http://127.0.0.1:5001";  //prescriptive
export const API_3 = "http://127.0.0.1:5002";  //predictive
export const API_4 = "http://127.0.0.1:5003";

export const API_URL = "http://127.0.0.1:5000";

// Function to format Markdown content
export const formatMarkdown = (text) => {
  // Make words surrounded by ** bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Replace new lines with <br> tags
  text = text.replace(/\n/g, '<br>');
  return text;
};

// Check if running in a browser
const isBrowser = typeof window !== 'undefined';

export function setCookie(apiName) {
  if (isBrowser) {
    localStorage.setItem('api_name', apiName);
  }
}

export function setProjectName(projectName) {
  if (isBrowser) {
    localStorage.setItem('project_name', projectName);
  }
}

export function getProjectName() {
  if (isBrowser) {
    const project_name = localStorage.getItem('project_name');
    return project_name;
  }
  return null;
}

export function getCookie() {
  if (isBrowser) {
    const apiName = localStorage.getItem('api_name');
    return apiName;
  }
  return null;
}

export function updateCookie(newApiName) {
  if (isBrowser) {
    localStorage.setItem('api_name', newApiName);
  }
}
