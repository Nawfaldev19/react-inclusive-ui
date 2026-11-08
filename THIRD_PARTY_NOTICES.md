# Third-party notices

This project's own code is MIT licensed (see [LICENSE](LICENSE)). The published library has **no runtime dependencies**; React and React DOM are peer dependencies provided by the consuming app. Everything below is used only for development, testing, building, or the documentation site, and is installed by npm rather than copied into the repository.

## Direct development dependencies

| Package | License | Purpose |
|---|---|---|
| react, react-dom | MIT | Peer dependency; also used by tests and the docs site |
| typescript | Apache-2.0 | Type checking and declaration output |
| vite, @vitejs/plugin-react | MIT | Library build, docs site |
| vitest, @vitest/coverage-v8 | MIT | Unit and component tests |
| @testing-library/react, @testing-library/user-event, @testing-library/jest-dom | MIT | Component testing |
| jsdom | MIT | DOM for tests |
| @playwright/test | Apache-2.0 | Browser tests |
| eslint, @eslint/js, typescript-eslint, eslint-plugin-react-hooks, globals | MIT | Linting |
| prettier | MIT | Code formatting |
| lucide-react | ISC | Icons on the documentation site only |
| @types/react, @types/react-dom, @types/node | MIT | Type definitions |

Transitive development dependencies are MIT, ISC, Apache-2.0, BSD-2/3-Clause, MIT-0, BlueOak-1.0.0, or Python-2.0, plus the browser-support dataset `caniuse-lite` (CC-BY-4.0), used by build tooling only.

## Fonts

Loaded by the documentation site from Google Fonts; not redistributed. Apps using the library load their own fonts.

| Font | License |
|---|---|
| Fraunces | SIL Open Font License 1.1 |
| Inter | SIL Open Font License 1.1 |
| JetBrains Mono | SIL Open Font License 1.1 |

## Icons and images

- The library's close and sort icons are original SVG drawn for this project.
- The favicon (`public/favicon.svg`) is original artwork.
- Lucide icons (ISC) appear on the documentation site only.
