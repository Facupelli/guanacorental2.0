/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
// import withBundleAnalyzer from "@next/bundle-analyzer";

await import("./env.mjs");

/** @type {import("next").NextConfig} */
const config = {
  // Recommended: this will reduce output
  // Docker image size by 80%+
  output: "standalone",
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.guanacorental.shop" },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // Nginx will do gzip compression. We disable
  // compression here so we can prevent buffering
  // streaming responses
  compress: false,
};

export default config;

// export default withBundleAnalyzer({});
