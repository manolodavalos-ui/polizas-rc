import type { NextConfig } from "next";
import { VERSION_ACTUAL } from "./src/lib/cambios";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: VERSION_ACTUAL,
    NEXT_PUBLIC_BUILD_ID: new Date().toISOString(),
  },
};

export default nextConfig;
