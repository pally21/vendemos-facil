import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que Next detecte un root incorrecto cuando hay lockfiles fuera del proyecto.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
