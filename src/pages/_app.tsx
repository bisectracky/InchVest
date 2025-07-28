'use client';

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { PrivyProvider } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PrivyProvider
      appId="cmdn0bn1001vtlg0jaxhay57w"
      config={{
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <SmartWalletsProvider
        config={{
          paymasterContext: {
            mode: "SPONSORED",
            calculateGasLimits: true,
            expiryDuration: 300,
            sponsorshipInfo: {
              webhookData: {},
              smartAccountInfo: {
                name: "Pimlico",
                version: "2.0.0",
              },
            },
          },
        }}
      >
        <Component {...pageProps} />
      </SmartWalletsProvider>
    </PrivyProvider>
  );
}
