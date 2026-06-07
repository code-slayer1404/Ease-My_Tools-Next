import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,

    typedRoutes: true,

    eslint: {
        ignoreDuringBuilds: true,
    },

    typescript: {
        ignoreBuildErrors: true,
    },
    // Allows the worker engine to handle complex binary structures safely
    serverExternalPackages: ['@huggingface/transformers'],
};

export default nextConfig;