export const getOtpSessionId = (): string | null => {
  return sessionStorage.getItem("otpSessionId");
};

export const setOtpSessionId = (otpSessionId: string): void => {
  sessionStorage.setItem("otpSessionId", otpSessionId);
};