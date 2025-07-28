const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,

  async headers() {
    if (isDev) {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Content-Security-Policy",
              value:
                "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
            },
          ],
        },
      ];
    }

    // In production, use a tighter policy
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval'
              https://auth.privy.io
              https://privy-cdn.privy.io
              https://challenges.cloudflare.com
              'sha256-NHm6oPJKWoG64nRG8ZJtL7AWiA5+ZLnfDjKbgeZRCnQ=';
              connect-src 'self' https://api.web3modal.org https://auth.privy.io https://rpc.walletconnect.com https://pulse.walletconnect.org wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://*.rpc.privy.systems https://explorer-api.walletconnect.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://privy-cdn.privy.io;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' blob: data: https:;
              frame-src https://auth.privy.io https://verify.walletconnect.com https://challenges.cloudflare.com;
              object-src 'none';
            `.replace(/\n/g, " ").replace(/\s{2,}/g, " ").trim()
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
