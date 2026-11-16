import js from "@eslint/js"
import boundaries from "eslint-plugin-boundaries"
import checkFile from "eslint-plugin-check-file"
import jsxA11y from "eslint-plugin-jsx-a11y"
import perfectionist from "eslint-plugin-perfectionist"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import tseslint from "typescript-eslint"

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url))

export default tseslint.config(
  {
    ignores: ["dist", "src/routeTree.gen.ts", "src/types/api.d.ts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      perfectionist,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "perfectionist/sort-imports": [
        "warn",
        {
          type: "alphabetical",
          order: "asc",
          ignoreCase: true,
          newlinesBetween: 1,
          internalPattern: ["^@/.+"],
          groups: [
            "side-effect",
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
            ["type-builtin", "type-external"],
            "type-internal",
            ["type-parent", "type-sibling", "type-index"],
            "unknown",
          ],
        },
      ],
      "perfectionist/sort-named-imports": [
        "warn",
        { type: "alphabetical", order: "asc", ignoreCase: true },
      ],
      "perfectionist/sort-exports": [
        "warn",
        { type: "alphabetical", order: "asc", ignoreCase: true },
      ],
      "perfectionist/sort-named-exports": [
        "warn",
        { type: "alphabetical", order: "asc", ignoreCase: true },
      ],
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        tsconfigRootDir,
      },
    },
  },
  {
    // FSD 레이어 경계 규칙. 의존 방향 (상위 -> 하위):
    // app > routes(pages) > widgets > features > entities > shared|types
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}", "src/test/**"],
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app" },
        { type: "routes", pattern: "src/routes" },
        { type: "widgets", pattern: "src/widgets/*", capture: ["slice"] },
        { type: "features", pattern: "src/features/*", capture: ["slice"] },
        { type: "entities", pattern: "src/entities/*", capture: ["slice"] },
        { type: "shared", pattern: "src/shared" },
        { type: "lib", pattern: "src/lib/*", capture: ["slice"] },
        { type: "types", pattern: "src/types" },
      ],
      "boundaries/include": ["src/**/*"],
      "import/resolver": {
        typescript: {
          project: "tsconfig.app.json",
        },
      },
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: [{ element: { type: "app" } }],
              allow: [
                { to: { element: { type: "app" } } },
                { to: { element: { type: "routes" } } },
                { to: { element: { type: "widgets" } } },
                { to: { element: { type: "features" } } },
                { to: { element: { type: "entities" } } },
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "lib" } } },
                { to: { element: { type: "types" } } },
              ],
            },
            {
              from: [{ element: { type: "routes" } }],
              allow: [
                { to: { element: { type: "routes" } } },
                { to: { element: { type: "widgets" } } },
                { to: { element: { type: "features" } } },
                { to: { element: { type: "entities" } } },
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "lib" } } },
                { to: { element: { type: "types" } } },
              ],
            },
            {
              from: [{ element: { type: "widgets" } }],
              allow: [
                {
                  to: {
                    element: {
                      type: "widgets",
                      captured: { slice: "{{ from.element.captured.slice }}" },
                    },
                  },
                },
                { to: { element: { type: "features" } } },
                { to: { element: { type: "entities" } } },
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "lib" } } },
                { to: { element: { type: "types" } } },
              ],
            },
            {
              from: [{ element: { type: "features" } }],
              allow: [
                {
                  to: {
                    element: {
                      type: "features",
                      captured: { slice: "{{ from.element.captured.slice }}" },
                    },
                  },
                },
                { to: { element: { type: "entities" } } },
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "lib" } } },
                { to: { element: { type: "types" } } },
              ],
            },
            {
              from: [{ element: { type: "entities" } }],
              allow: [
                {
                  to: {
                    element: {
                      type: "entities",
                      captured: { slice: "{{ from.element.captured.slice }}" },
                    },
                  },
                },
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "types" } } },
              ],
            },
            {
              from: [
                { element: { type: "shared" } },
                { element: { type: "types" } },
              ],
              allow: [
                { to: { element: { type: "shared" } } },
                { to: { element: { type: "lib" } } },
                { to: { element: { type: "types" } } },
              ],
            },
            {
              from: [{ element: { type: "lib" } }],
              allow: [
                {
                  to: {
                    element: {
                      type: "lib",
                      captured: { slice: "{{ from.element.captured.slice }}" },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/auth-client",
                "@/lib/auth-client/**",
                "@umc-product/auth-client/**",
                "!@umc-product/auth-client/react",
              ],
              message:
                "auth-client는 @umc-product/auth-client 또는 @umc-product/auth-client/react 만 import합니다.",
            },
          ],
        },
      ],
    },
  },
  {
    // routes/widgets는 feature 공개 API(index)만 사용한다. (flat config는 rule을 덮어쓰므로 auth-client 패턴도 함께 둔다)
    files: ["src/routes/**/*.{ts,tsx}", "src/widgets/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/auth-client",
                "@/lib/auth-client/**",
                "@umc-product/auth-client/**",
                "!@umc-product/auth-client/react",
              ],
              message:
                "auth-client는 @umc-product/auth-client 또는 @umc-product/auth-client/react 만 import합니다.",
            },
            {
              group: ["@/features/*/*", "@/features/*/**"],
              message:
                "routes/widgets에서는 feature deep import 대신 @/features/<name> 공개 API(index)만 사용합니다.",
            },
          ],
        },
      ],
    },
  },
  {
    // typed lint (type-checked recommended). 노이즈가 큰 규칙은 아래에서 단계적으로 완화한다.
    files: ["src/**/*.{ts,tsx}"],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
    rules: {
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
  {
    // 테스트는 mock/any 사용이 잦아 typed unsafe 계열을 끈다.
    files: ["src/**/*.test.{ts,tsx}", "src/test/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-base-to-string": "off",
    },
  },
  {
    // TanStack Router의 redirect()/notFound()는 throw 하는 것이 공식 사용법이다.
    files: ["src/routes/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/only-throw-error": "off",
    },
  },
  {
    files: ["src/**/*.tsx"],
    plugins: { "jsx-a11y": jsxA11y },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  {
    // 파일명은 kebab-case. PascalCase 컴포넌트 파일이 남은 경로는 rename PR 전까지 warn.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/routeTree.gen.ts", "src/routes/**"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{ts,tsx}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
  {
    files: [
      "src/features/points/ui/**/*.{ts,tsx}",
      "src/widgets/admin-shell/**/*.{ts,tsx}",
    ],
    rules: {
      "check-file/filename-naming-convention": [
        "warn",
        { "**/*.{ts,tsx}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
  {
    files: ["scripts/**/*.{js,mjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
)
