# Security

A UI component library has a small attack surface, but it is not zero. This document lists what the library does and does not protect against.

## Threats and mitigations

| Threat | Mitigation |
|---|---|
| Cross-site scripting through component content | Components render text and React nodes only. No component uses `dangerouslySetInnerHTML`, `innerHTML`, or `eval`. Toast titles and descriptions are typed as strings and rendered as text. |
| Injected styles or class names | Class names are built from fixed prefixes and typed union values (`variant`, `tone`, `size`), not free-form user input. |
| Clickjacking-style confusion in dialogs | The modal overlays the whole viewport, keeps focus inside, and marks the rest of the page `inert`, so neither keyboard nor pointer input reaches the controls behind it. |
| Unintended form submission | `Button` defaults to `type="button"`; only an explicit `type="submit"` submits a form. |
| Storage misuse | `ThemeProvider` stores only the theme preference (`light`, `dark`, or `system`) and validates it on read; unknown values are ignored. |
| Supply chain | Zero runtime dependencies. React is a peer dependency. All development dependencies use permissive licenses (see [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)). |

## Responsibilities that stay with the consuming app

- Validating and sanitizing data before it reaches components (for example, never pass untrusted HTML into a component's children through `dangerouslySetInnerHTML` in the app).
- Content-Security-Policy and other HTTP headers.
- Authentication, authorization, and anything server side.

## Reporting

This is a portfolio project without a security contact. Please open an issue on the repository.
