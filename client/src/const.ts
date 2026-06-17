export const COOKIE_NAME = "app_session_id";

export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

export const AXIOS_TIMEOUT_MS = 30000;

export const UNAUTHED_ERR_MSG = "Please login (10001)";

export const NOT_ADMIN_ERR_MSG =
  "You do not have required permission (10002)";

/**
 * Generates login URL based on current origin
 */
export const getLoginUrl = () => {
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  return `${baseUrl}/api/auth/login`;
};