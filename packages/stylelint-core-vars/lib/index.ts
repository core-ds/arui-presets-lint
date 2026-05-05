import { type Declaration, type Root, type Rule as PostcssRule } from 'postcss';
import stylelint from 'stylelint';

import {
    colorsSet,
    findOldVars,
    findTypographyMixins,
    findVars,
    type MixinDef,
    type MixinPropsMap,
    type SubstitutionResult,
    toOneLine,
    VARS_AVAILABLE,
} from './utils.js';

export const RULE_USE_VARS = 'stylelint-core-vars/use-vars';
export const RULE_USE_ONE_OF_VARS = 'stylelint-core-vars/use-one-of-vars';
export const RULE_USE_MIXINS = 'stylelint-core-vars/use-mixins';
export const RULE_USE_ONE_OF_MIXINS = 'stylelint-core-vars/use-one-of-mixins';
export const RULE_DO_NOT_USE_DARK_COLORS = 'stylelint-core-vars/do-not-use-dark-colors';
export const RULE_DO_NOT_USE_OLD_VARS = 'stylelint-core-vars/do-not-use-old-vars';

type RuleName =
    | typeof RULE_USE_VARS
    | typeof RULE_USE_ONE_OF_VARS
    | typeof RULE_USE_MIXINS
    | typeof RULE_USE_ONE_OF_MIXINS
    | typeof RULE_DO_NOT_USE_DARK_COLORS
    | typeof RULE_DO_NOT_USE_OLD_VARS;

// stylelint.RuleMessage сужает аргументы до примитивов; наши rule'ы передают
// массивы, поэтому оборачиваем ruleMessages с сохранением исходных сигнатур.
type AnyMessage = string | ((...args: never[]) => string);
const typedRuleMessages = <T extends Record<string, AnyMessage>>(ruleName: string, msgs: T): T =>
    stylelint.utils.ruleMessages(ruleName, msgs);

export const messages = {
    [RULE_USE_VARS]: typedRuleMessages(RULE_USE_VARS, {
        expected: (variable: string | string[], value: string) =>
            `Use variable 'var(${String(variable)})' instead of plain value '${value}'`,
    }),
    [RULE_USE_ONE_OF_VARS]: typedRuleMessages(RULE_USE_ONE_OF_VARS, {
        expected: (variables: string[], value: string) => {
            const variablesPart = variables.map((v) => `var(${v})`).join('\n');

            return `Use variables instead of plain value '${value}':\n${variablesPart}\n`;
        },
    }),
    [RULE_DO_NOT_USE_OLD_VARS]: typedRuleMessages(RULE_DO_NOT_USE_OLD_VARS, {
        expected: (variables: string[], value: string | string[], fixable = true) => {
            const valueStr = String(value);
            if (!variables.length) return `Ask you designer how to replace old token '${valueStr}'`;

            const startMsg = fixable ? 'Use' : 'Cant find proper token, but you can use';

            if (variables.length === 1) {
                return `${startMsg} variable 'var(${variables[0]})' instead of old '${valueStr}'`;
            }

            const variablesPart = variables.map((v) => `var(${v})`).join('\n');

            return `${startMsg} one of new variables instead of old '${valueStr}':\n${variablesPart}\n`;
        },
    }),
    [RULE_USE_MIXINS]: typedRuleMessages(RULE_USE_MIXINS, {
        expected: ([mixin]: Array<{ name: string }>) =>
            `Use mixin '${mixin.name}' instead of plain values`,
    }),
    [RULE_USE_ONE_OF_MIXINS]: typedRuleMessages(RULE_USE_ONE_OF_MIXINS, {
        expected: (foundMixins: MixinDef[]) => {
            const mixinsPart = foundMixins
                .map(({ name, props }) => `${name} (${Object.values(props).join('|')})`)
                .join('\n');
            return `Use mixins instead of plain values:\n${mixinsPart}\n`;
        },
    }),
    [RULE_DO_NOT_USE_DARK_COLORS]: typedRuleMessages(RULE_DO_NOT_USE_DARK_COLORS, {
        expected: () => 'Do not use dark colors directly. Only light and static colors are allowed',
    }),
};

type Matcher = (
    cssValue: string,
    prop: string,
    options: { allowNumericValues?: boolean },
) => SubstitutionResult | undefined;

type ShouldReport = (fixable: boolean, fixed: boolean) => boolean;

const checkVars = (
    decl: Declaration,
    result: stylelint.PostcssResult,
    context: stylelint.RuleContext,
    ruleName: RuleName,
    matcher: Matcher,
    shouldReport: ShouldReport,
    options: { allowNumericValues?: boolean } = {},
): void => {
    const { prop, raws } = decl;

    let value = toOneLine(decl.value);
    let substitution: SubstitutionResult | undefined;

    const previousValues: Array<SubstitutionResult & { diff: number }> = [];

    while ((substitution = matcher(value, prop, options))) {
        let fixed = false;

        value = `${value.slice(0, Math.max(0, substitution.index))}${substitution.fixedValue}${value.slice(Math.max(0, substitution.index + substitution.value.length))}`;

        if (context.fix && substitution.fixable) {
            decl.value = value;
            fixed = true;
        }

        const originalValueIndex = previousValues.reduce(
            (acc, sub) => (acc > sub.index + sub.diff ? acc - sub.diff : acc),
            substitution.index,
        );

        if (shouldReport(substitution.fixable, fixed)) {
            const index =
                originalValueIndex + prop.length + (raws.between?.length ?? 0) + substitution.index;
            const endIndex = index + substitution.value.length;

            const messageFn = messages[ruleName].expected as (...args: unknown[]) => string;

            stylelint.utils.report({
                result,
                ruleName,
                message: messageFn(
                    substitution.variables,
                    substitution.value,
                    substitution.fixable,
                ),
                node: decl,
                word: value,
                index,
                endIndex,
            });
        }

        previousValues.unshift({
            ...substitution,
            diff: substitution.fixedValue.length - substitution.value.length,
        });
    }
};

const checkTypography = (
    rule: PostcssRule,
    result: stylelint.PostcssResult,
    context: stylelint.RuleContext,
    ruleName: typeof RULE_USE_MIXINS | typeof RULE_USE_ONE_OF_MIXINS,
): void => {
    const typographyProps = (rule.nodes ?? []).reduce<MixinPropsMap>((acc, node) => {
        if (
            node.type === 'decl' &&
            ['font-size', 'line-height', 'font-weight'].includes(node.prop)
        ) {
            acc[node.prop] = node.value;
        }
        return acc;
    }, {});

    const hasTypography = 'font-size' in typographyProps;
    if (!hasTypography) return;

    const foundMixins = findTypographyMixins(typographyProps);

    if (!foundMixins || !foundMixins.length) return;

    const exactMixin = foundMixins.length === 1;

    let fixed = false;
    if (context.fix && exactMixin) {
        fixed = true;
        const { name, props } = foundMixins[0];

        const before = (rule.nodes?.[0] as Declaration | undefined)?.raws.before ?? '';
        rule.walkDecls((decl) => {
            if (decl.prop in props) {
                decl.remove();
            }
        });

        rule.prepend(`${before}@mixin ${name};\n`);
    }

    const shouldReport =
        !fixed &&
        ((ruleName === RULE_USE_ONE_OF_MIXINS && !exactMixin) ||
            (ruleName === RULE_USE_MIXINS && exactMixin));

    if (shouldReport) {
        const messageFn = messages[ruleName].expected as (...args: unknown[]) => string;

        stylelint.utils.report({
            result,
            ruleName,
            message: messageFn(foundMixins),
            node: rule,
            word: 'font-size',
        });
    }
};

const checkDarkColorsUsage = (decl: Declaration, result: stylelint.PostcssResult): void => {
    const { prop, raws } = decl;

    const value = toOneLine(decl.value);

    const matches = /--color-dark-[\w-]+/.exec(value);

    if (matches && colorsSet.has(matches[0])) {
        const [match] = matches;
        const index = prop.length + (raws.between?.length ?? 0) + decl.value.indexOf(match);
        const endIndex = index + match.length;

        stylelint.utils.report({
            result,
            ruleName: RULE_DO_NOT_USE_DARK_COLORS,
            message: messages[RULE_DO_NOT_USE_DARK_COLORS].expected(),
            node: decl,
            word: value,
            index,
            endIndex,
        });
    }
};

// stylelint.Rule = function & { ruleName, messages }. Хелпер навешивает
// нужные поля на rule-функцию и приводит к ожидаемому типу.
const makeRule = <P, S>(
    ruleName: RuleName,
    fn: (
        primaryOption: P,
        secondaryOptions: S,
        context: stylelint.RuleContext,
    ) => (root: Root, result: stylelint.PostcssResult) => void,
): stylelint.Rule<P, S> =>
    Object.assign(fn, {
        ruleName,
        messages: messages[ruleName] as unknown as stylelint.RuleMessages,
    });

export default [
    stylelint.createPlugin(
        RULE_USE_VARS,
        makeRule<boolean, { allowNumericValues?: boolean } | undefined>(
            RULE_USE_VARS,
            (enabled, config, context) => {
                if (!enabled || !VARS_AVAILABLE) {
                    return () => {};
                }

                const allowNumericValues = config?.allowNumericValues || false;

                return (root, result) => {
                    root.walkDecls((decl) => {
                        checkVars(
                            decl,
                            result,
                            context,
                            RULE_USE_VARS,
                            findVars,
                            (fixable, fixed) => fixable && !fixed,
                            { allowNumericValues },
                        );
                    });
                };
            },
        ),
    ),
    stylelint.createPlugin(
        RULE_USE_ONE_OF_VARS,
        makeRule<boolean, { allowNumericValues?: boolean } | undefined>(
            RULE_USE_ONE_OF_VARS,
            (enabled, config, context) => {
                if (!enabled || !VARS_AVAILABLE) {
                    return () => {};
                }

                const allowNumericValues = config?.allowNumericValues || false;

                return (root, result) => {
                    root.walkDecls((decl) => {
                        checkVars(
                            decl,
                            result,
                            context,
                            RULE_USE_ONE_OF_VARS,
                            findVars,
                            (fixable, fixed) => !fixable && !fixed,
                            { allowNumericValues },
                        );
                    });
                };
            },
        ),
    ),
    stylelint.createPlugin(
        RULE_DO_NOT_USE_OLD_VARS,
        makeRule<boolean, undefined>(RULE_DO_NOT_USE_OLD_VARS, (enabled, _config, context) => {
            if (!enabled || !VARS_AVAILABLE) {
                return () => {};
            }

            return (root, result) => {
                root.walkDecls((decl) => {
                    checkVars(
                        decl,
                        result,
                        context,
                        RULE_DO_NOT_USE_OLD_VARS,
                        findOldVars,
                        (_fixable, fixed) => !fixed,
                    );
                });
            };
        }),
    ),
    stylelint.createPlugin(
        RULE_USE_MIXINS,
        makeRule<boolean, undefined>(RULE_USE_MIXINS, (enabled, _config, context) => {
            if (!enabled || !VARS_AVAILABLE) {
                return () => {};
            }

            return (root, result) => {
                root.walkRules((rule) => {
                    checkTypography(rule, result, context, RULE_USE_MIXINS);
                });
            };
        }),
    ),
    stylelint.createPlugin(
        RULE_USE_ONE_OF_MIXINS,
        makeRule<boolean, undefined>(RULE_USE_ONE_OF_MIXINS, (enabled, _config, context) => {
            if (!enabled || !VARS_AVAILABLE) {
                return () => {};
            }

            return (root, result) => {
                root.walkRules((rule) => {
                    checkTypography(rule, result, context, RULE_USE_ONE_OF_MIXINS);
                });
            };
        }),
    ),
    stylelint.createPlugin(
        RULE_DO_NOT_USE_DARK_COLORS,
        makeRule<boolean, undefined>(RULE_DO_NOT_USE_DARK_COLORS, (enabled) => {
            if (!enabled || !VARS_AVAILABLE) {
                return () => {};
            }

            return (root, result) => {
                root.walkDecls((decl) => {
                    checkDarkColorsUsage(decl, result);
                });
            };
        }),
    ),
];
