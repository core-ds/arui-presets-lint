# Alfa-Bank lint standards (arui-presets-lint)

This project uses `arui-presets-lint` (shared ESLint / Stylelint / Prettier
configs). Follow the rules below so the code you write passes lint on the first
pass. These mirror the enforced config — violations are reported by ESLint,
Stylelint and lefthook.

## Imports and ordering

Group imports in this exact order, with one blank line between groups:

1. Node.js built-ins (`node:fs`, `node:path`, …) — always use the `node:` prefix.
2. `react`, `redux`, then other external packages (`@scope/pkg`, `pkg`).
3. Alfa-Bank packages: `@alfalab/*`, `arui-feather/*`, `arui-private/*`.
4. Aliased imports starting with `#`.
5. Parent imports (`../`).
6. Sibling imports (`./`).
7. Style imports (`*.css`, `*.scss`).

```ts
import { useState } from 'react';

import { Button } from '@alfalab/core-components/button';

import { helper } from '#shared/helper';

import { parentUtil } from '../utils';
import { siblingUtil } from './sibling';

import './styles.css';
```

A blank line is required after the last import. Do not use absolute paths or
relative package imports; do not duplicate imports from the same path.

## lodash

Never import from the `lodash` barrel or from `lodash.*` packages. Import the
specific function directly:

```ts
// Correct
import isEqual from 'lodash/isEqual';

// Wrong — reported by no-restricted-imports
import { isEqual } from 'lodash';
import isEqual from 'lodash.isequal';
```

## Type imports

Use inline type specifiers, not separate `import type` statements. Mixed
value/type imports are written inline:

```ts
// Correct
import { type FC, useState } from 'react';
import { type Config } from 'stylelint';

// Wrong — reported by consistent-type-imports / consistent-type-specifier-style
import type { FC } from 'react';
import { useState } from 'react';
```

## CSS and design tokens

Use Alfa-Bank design-system CSS variables and mixins instead of hardcoded
values. This is enforced by `@alfalab/stylelint-core-vars`.

- Colors: use `var(--color-light-...)` tokens; never write a raw hex/rgb color
  and never reference `--color-dark-*` directly.
- Spacing, gaps, shadows, border-radius: use the corresponding design tokens.
- Typography: use the provided `@mixin`s instead of hand-written
  `font-size` / `line-height` / `font-weight` sets.

```css
.card {
    color: var(--color-light-text-primary);
    gap: var(--gap-m);
    border-radius: var(--border-radius-m);
    box-shadow: var(--shadow-m);
}
```

## React

- Type children explicitly with `children?: ReactNode`; do not use
  `PropsWithChildren`.
- Keep `React` in scope in files that use JSX (`react-in-jsx-scope`).
- Do not use the array index as a `key`; use a stable unique value.
- Every `<button>` needs an explicit `type` (`button`, `submit`, …).
- Self-close elements without children (`<Icon />`, not `<Icon></Icon>`).
- Booleans props are written explicitly: `disabled={true}`, not `disabled`.
- Do not add redundant curly braces in JSX: `prop="value"`, not `prop={'value'}`.
- Provide a complete dependency array for hooks (`exhaustive-deps` is an error).

```tsx
type Props = {
    title: string;
    children?: ReactNode;
};

const Panel = ({ title, children }: Props) => (
    <section>
        <button type="button">{title}</button>
        {children}
    </section>
);
```

## TypeScript

- Naming: `PascalCase` for types and interfaces; `camelCase`/`PascalCase`/
  `UPPER_CASE` for variables; `camelCase`/`PascalCase` for functions.
- Do not leave floating promises — `await` them or explicitly mark with `void`.
- Arrays use the `array-simple` style: `string[]` for simple element types,
  `Array<T>` only for complex ones.

## General

- Do not use `++` / `--`; use `x += 1` / `x -= 1`.
- Prefer template literals over string concatenation.
- Do not nest ternary expressions.
- Do not reassign function parameters.
- Name files and folders in `kebab-case`.

## Formatting (Prettier)

- Print width: 100 characters.
- Indentation: 4 spaces.
- Single quotes, including in JSX (`jsxSingleQuote`).
- Trailing commas everywhere (`trailingComma: 'all'`).

## eslint-disable comments

Every `eslint-disable` / `eslint-disable-next-line` must include a description
explaining why the rule is disabled:

```ts
// eslint-disable-next-line no-console -- intentional diagnostic output
console.log(value);
```
