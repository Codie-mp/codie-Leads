import { toast } from 'sonner';

export function handleApiError(error: any, defaultTitle: string = "Operation Failed", retryAction?: () => void) {
  console.error("API Error:", error);
  
  let errMsg = error?.message || "An unexpected error occurred.";
  
  try {
    const parsed = JSON.parse(errMsg);
    if (parsed.error) {
       if (typeof parsed.error === 'string') errMsg = parsed.error;
       else if (parsed.error.message) errMsg = parsed.error.message;
    }
  } catch (e) {}

  let errorTitle = defaultTitle;
  let errorDescription = errMsg;

  if (errMsg.toLowerCase().includes("failed to fetch") || errMsg.toLowerCase().includes("network error")) {
    errorTitle = "Network Error";
    errorDescription = "Failed to connect to the server. Please check your internet connection or ensure the server is running.";
  } else if (errMsg.includes("high demand") || errMsg.includes("503")) {
    errorTitle = "High Demand";
    errorDescription = "The AI Model is currently experiencing high demand. Please try again later.";
  } else if (errMsg.includes('api key') || errMsg.includes('API_KEY')) {
    errorTitle = "Configuration Error";
    errorDescription = "API Key error. Please check your Settings to ensure it is configured correctly.";
  } else if (errMsg.includes('unreachable') || errMsg.includes('timeout')) {
    errorTitle = "Timeout Error";
    errorDescription = "The request took too long. Please try again later.";
  }

  if (retryAction) {
    toast.error(errorTitle, {
      description: errorDescription,
      duration: 8000,
      action: {
        label: "Retry",
        onClick: retryAction
      }
    });
  } else {
    toast.error(errorTitle, {
      description: errorDescription,
      duration: 8000
    });
  }
}
