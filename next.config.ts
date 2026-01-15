import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: config => {
      const rules = config.module.rules
        .find((rule: { oneOf: any; }) => typeof rule.oneOf === "object")
        .oneOf.filter((rule: { use: any; }) => Array.isArray(rule.use));
      rules.forEach((rule: { use: any[]; }) => {
        rule.use.forEach((moduleLoader: { loader: string | string[] | undefined; options: { modules: any; }; }) => {
          if (
            moduleLoader.loader !== undefined &&
            moduleLoader.loader.includes("css-loader") &&
            typeof moduleLoader.options.modules === "object"
          ) {
            moduleLoader.options = {
              ...moduleLoader.options,
              modules: {
                ...moduleLoader.options.modules,
                // This is where we allow camelCase class names
                exportLocalsConvention: "camelCase",
              },
            };
          }
        });
      });
      return config;
    },
};

export default nextConfig;
