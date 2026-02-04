"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";
import { WaitlistProvider } from "@/contexts/WaitlistContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <WaitlistProvider>{children}</WaitlistProvider>
    </Provider>
  );
}

export default Providers;
