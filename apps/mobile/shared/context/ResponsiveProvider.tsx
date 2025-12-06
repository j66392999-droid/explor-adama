import React, { createContext, useEffect, useState } from "react";
import { Dimensions, ScaledSize } from "react-native";

interface ResponsiveContextValue {
  window: ScaledSize;
}

export const ResponsiveContext = createContext<ResponsiveContextValue>({
  window: Dimensions.get("window"),
});

export const ResponsiveProvider = ({ children }: { children: React.ReactNode }) => {
  const [window, setWindow] = useState(Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setWindow(window); // triggers responsive recalculation globally
    });

    return () => subscription?.remove?.();
  }, []);

  return (
    <ResponsiveContext.Provider value={{ window }}>
      {children}
    </ResponsiveContext.Provider>
  );
};
