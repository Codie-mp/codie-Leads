import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    ignores: [
      ".next/**",
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "*.tsbuildinfo",
      "public/**",
      ".specify/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/immutability": "off",
    },
  },
];
