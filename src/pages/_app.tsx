'use client';

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { PrivyProvider } from "@privy-io/react-auth";

export default function App({ Component, pageProps }: AppProps) {

  return (
    <PrivyProvider
      appId="cmdn0bn1001vtlg0jaxhay57w" // <- Replace with your real App ID
      config={{
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <Component {...pageProps} />
    </PrivyProvider>
  );
}
