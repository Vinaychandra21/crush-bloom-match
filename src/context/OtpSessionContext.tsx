import React, { createContext, useContext, useState, ReactNode } from "react";

type OtpSessionContextType = {
  otpSessionId: string;
  setOtpSessionId: (id: string) => void;
};

const OtpSessionContext = createContext<OtpSessionContextType | undefined>(
  undefined
);

export const useOtpSession = () => {
  const ctx = useContext(OtpSessionContext);
  if (!ctx)
    throw new Error("useOtpSession must be used within OtpSessionProvider");
  return ctx;
};

export const OtpSessionProvider = ({ children }: { children: ReactNode }) => {
  const [otpSessionId, setOtpSessionId] = useState<string>("");
  return (
    <OtpSessionContext.Provider value={{ otpSessionId, setOtpSessionId }}>
      {children}
    </OtpSessionContext.Provider>
  );
};
