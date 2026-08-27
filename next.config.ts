import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGitHubPages ? "/cs4620" : "",
  assetPrefix: isGitHubPages ? "/cs4620/" : undefined,
};

export default nextConfig;
