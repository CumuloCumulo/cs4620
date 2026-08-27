import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  trailingSlash: isGitHubPages,
  images: { unoptimized: true },
  basePath: isGitHubPages ? "/cs4620" : "",
  assetPrefix: isGitHubPages ? "/cs4620/" : undefined,
};

export default nextConfig;
