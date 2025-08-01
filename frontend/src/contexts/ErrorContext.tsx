import React, { createContext, useContext } from 'react';
import { useErrorHandler } from '../types/hooks'; 

const ErrorHandlerContext = createContext<ReturnType<typeof useErrorHandler> | null>(null);

export const ErrorHandlerProvider = ({ children }: { children: React.ReactNode }) => {
  const errorHandler = useErrorHandler();
  return (
    <ErrorHandlerContext.Provider value={errorHandler}>
      {children}
    </ErrorHandlerContext.Provider>
  );
};

export default ErrorHandlerContext
