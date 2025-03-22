/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['sulyap.dabcas.uk'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sulyap.dabcas.uk',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });

    return config
  },
}

module.exports = nextConfig 