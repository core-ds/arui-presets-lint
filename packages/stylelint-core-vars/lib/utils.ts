import { getPackagesSync } from '@manypkg/get-packages';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import postcss from 'postcss';

import oldNewMap from './old-new-map.js';

const require = createRequire(import.meta.url);
const { packages } = getPackagesSync(process.cwd());
const CORE_COMPONENTS_PACKAGE = '@alfalab/core-components';
const CORE_COMPONENTS_VARS_PACKAGE = '@alfalab/core-components-vars';
const TYPOGRAPHY_PROPS = ['font-size', 'line-height', 'font-weight'];

export type VarsMap = Record<string, string[]>;
export type MixinPropsMap = Record<string, string>;
export type MixinDef = { name: string; props: MixinPropsMap };
export type SubstitutionResult = {
    index: number;
    value: string;
    variables: string[];
    fixedValue: string;
    fixable: boolean;
};

export const vars = {
    gaps: loadVars('gaps.css'),
    shadows: loadVars('shadows-indigo.css'),
    colors: loadVars('colors-indigo.css'),
    borderRadiuses: loadVars('border-radius.css'),
};

export const colorsSet = Object.values(vars.colors).reduce<Set<string>>((acc, colorVars) => {
    for (const colorVar of colorVars) acc.add(colorVar);

    return acc;
}, new Set());

export const mixins: { typography: Record<string, MixinPropsMap> } = {
    typography: loadMixins('typography.css'),
};

const varsByProperties: Record<string, VarsMap> = {
    padding: vars.gaps,
    'padding-top': vars.gaps,
    'padding-right': vars.gaps,
    'padding-bottom': vars.gaps,
    'padding-left': vars.gaps,
    margin: vars.gaps,
    'margin-top': vars.gaps,
    'margin-right': vars.gaps,
    'margin-bottom': vars.gaps,
    'margin-left': vars.gaps,
    'box-shadow': vars.shadows,
    color: vars.colors,
    fill: vars.colors,
    background: vars.colors,
    'background-color': vars.colors,
    border: vars.colors,
    'border-top': vars.colors,
    'border-right': vars.colors,
    'border-bottom': vars.colors,
    'border-left': vars.colors,
    'border-radius': vars.borderRadiuses,
    'border-top-left-radius': vars.borderRadiuses,
    'border-top-right-radius': vars.borderRadiuses,
    'border-bottom-left-radius': vars.borderRadiuses,
    'border-bottom-right-radius': vars.borderRadiuses,
};

export const VARS_AVAILABLE = isCoreComponentsMonorepo() || isVarsPackagedInstalled();

function isCoreComponentsMonorepo(): boolean {
    return packages.some(({ packageJson: { name } }) => name === CORE_COMPONENTS_PACKAGE);
}

function isVarsPackagedInstalled(): boolean {
    function resolveVarsPackage(): boolean {
        try {
            require.resolve(`${CORE_COMPONENTS_VARS_PACKAGE}/package.json`);
            return true;
        } catch {
            return false;
        }
    }

    try {
        const rootPkgPath = require.resolve(`${CORE_COMPONENTS_PACKAGE}/package.json`);
        const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8')) as { version: string };
        const [coreComponentsVersion] = rootPkg.version.split('.');

        if (Number.parseInt(coreComponentsVersion, 10) >= 49) {
            return resolveVarsPackage();
        }

        return true;
    } catch {
        return resolveVarsPackage();
    }
}

function resolveVarsFile(file: string): string {
    let filepath: string;

    if (isCoreComponentsMonorepo()) {
        const pkg = packages.find((p) => p.packageJson.name === CORE_COMPONENTS_VARS_PACKAGE);
        if (!pkg) {
            throw new Error(`${CORE_COMPONENTS_VARS_PACKAGE} not found in monorepo`);
        }

        filepath = path.join(pkg.dir, 'src', file);
    } else {
        try {
            filepath = require.resolve(`${CORE_COMPONENTS_VARS_PACKAGE}/${file}`);
        } catch {
            filepath = require.resolve(`${CORE_COMPONENTS_PACKAGE}/vars/${file}`);
        }
    }

    return filepath;
}

function loadVars(file: string): VarsMap {
    const result: VarsMap = {};

    if (isCoreComponentsMonorepo() || isVarsPackagedInstalled()) {
        const filepath = resolveVarsFile(file);
        const content = fs.readFileSync(filepath, { encoding: 'utf8' });
        const root = postcss.parse(content, { from: filepath });

        root.walkDecls((decl) => {
            (result[toOneLine(decl.value)] ||= []).push(decl.prop);
        });
    } else {
        console.error('Add @alfalab/core-components to project dependencies');
    }

    return result;
}

function loadMixins(file: string): Record<string, MixinPropsMap> {
    const result: Record<string, MixinPropsMap> = {};

    if (isCoreComponentsMonorepo() || isVarsPackagedInstalled()) {
        const filepath = resolveVarsFile(file);
        const content = fs.readFileSync(filepath, { encoding: 'utf8' });
        const root = postcss.parse(content, { from: filepath });

        root.walkAtRules('define-mixin', (atRule) => {
            const params = atRule.params.split(/\s/);
            const name = params[0];

            if (
                name.startsWith('system_') ||
                name.startsWith('styrene_') ||
                name.startsWith('legacy_')
            ) {
                return;
            }

            const decls: MixinPropsMap = {};

            atRule.walkDecls((decl) => {
                decls[decl.prop] = decl.value;
            });

            result[name] = decls;
        });
    } else {
        console.error('Add @alfalab/core-components to project dependencies');
    }

    return result;
}

function formatVar(variable: string): string {
    return variable.startsWith('var(') ? variable : `var(${variable})`;
}

function findSubstring(str: string, substr: string, sep = ' ', pos = 0): number {
    for (
        let index = str.indexOf(substr, pos);
        index !== -1;
        index = str.indexOf(substr, index + substr.length)
    ) {
        if (
            (index === 0 || str.slice(index - sep.length, index) === sep) &&
            (index + substr.length === str.length ||
                str.slice(index + substr.length, index + substr.length + sep.length) === sep)
        ) {
            return index;
        }
    }

    return -1;
}

function getColorVariants(prop: string): string[] {
    switch (prop) {
        case 'color':
            return ['text'];
        case 'background-color':
        case 'background':
            return ['bg', 'specialbg', 'graphic'];
        case 'border':
        case 'border-top':
        case 'border-right':
        case 'border-bottom':
        case 'border-left':
            return ['border', 'graphic', 'bg', 'specialbg'];
        default:
            return [];
    }
}

function choiceVars(variables: string[], prop: string, group: string | undefined): string[] {
    if (group === 'colors') {
        const variants = getColorVariants(prop);

        const condition = (variable: string): boolean =>
            variants.some((variant) => variable.startsWith(`--color-light-${variant}`));

        return sortVarsByUsage(variables, variants).filter(condition);
    }

    return variables;
}

export function findVars(
    cssValue: string,
    prop: string,
    options: { allowNumericValues?: boolean },
): SubstitutionResult | undefined {
    const propVars = varsByProperties[prop];
    if (!propVars) return undefined;

    const group = getVarsGroup(propVars);

    if ((group === 'gaps' || group === 'borderRadiuses') && options.allowNumericValues) {
        return undefined;
    }

    for (const [value, variables] of Object.entries(propVars)) {
        const chosen = choiceVars(variables, prop, group);

        if (!chosen || !chosen.length) continue;

        const index = findSubstring(cssValue, value);

        if (index !== -1) {
            return {
                index,
                value,
                variables: chosen,
                fixedValue: formatVar(chosen[0]),
                fixable: chosen.length === 1,
            };
        }
    }

    return undefined;
}

export function findOldVars(cssValue: string, prop: string): SubstitutionResult | undefined {
    const matches = /var\(([^),]+)/g.exec(cssValue);

    if (!matches) return undefined;

    const oldVar = matches[1];
    const replacements = oldNewMap[oldVar];
    if (!replacements) return undefined;

    const variants = getColorVariants(prop);

    let variables = replacements.filter((r) => variants.some((v) => r.includes(v)));
    const fixable = variables.length === 1;

    if (!variables.length) {
        variables = replacements;
    }

    return {
        index: cssValue.indexOf(oldVar),
        value: oldVar,
        variables,
        fixedValue: variables.length ? variables[0] : 'NON_FIXABLE',
        fixable,
    };
}

export function findTypographyMixins(ruleProps: MixinPropsMap): MixinDef[] | null {
    const findMixin = (exact: boolean): MixinDef[] =>
        Object.entries(mixins.typography)
            .filter(([, mixinProps]) => {
                if (exact) {
                    return TYPOGRAPHY_PROPS.every((prop) => ruleProps[prop] === mixinProps[prop]);
                }

                return TYPOGRAPHY_PROPS.every(
                    (prop) => !ruleProps[prop] || ruleProps[prop] === mixinProps[prop],
                );
            })
            .map(([name, props]) => ({ name, props }));

    const exact = findMixin(true);
    if (exact.length) {
        return exact;
    }

    const fallbackMixins = findMixin(false);
    return fallbackMixins.length > 0 ? fallbackMixins : null;
}

export function toOneLine(value: string): string {
    return value.replace(/\n/, '').replace(/ {2,}/, ' ');
}

function getVarsGroup(varsSet: VarsMap): string | undefined {
    return Object.keys(vars).find((group) => vars[group as keyof typeof vars] === varsSet);
}

function sortVarsByUsage(arr: string[], sortingArr: string[]): string[] {
    // eslint-disable-next-line unicorn/no-array-sort -- toSorted требует es2023, проект на es2022
    return arr.slice().sort((a, b) => {
        const aUsage = a.slice(2).split('-')[2];
        const bUsage = b.slice(2).split('-')[2];
        const aIndex = sortingArr.indexOf(aUsage);
        const bIndex = sortingArr.indexOf(bUsage);
        if (aIndex === -1 || bIndex === -1) return 0;
        return aIndex - bIndex;
    });
}
