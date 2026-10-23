// @ts-check
// JavaScript нужен для загрузки исходного TS-конфига через CLI Stylelint:
// его загрузчик не подменяет расширение .js на .ts во вложенных импортах.
import { parse } from 'postcss';
import valueParser from 'postcss-value-parser';
import stylelint from 'stylelint';

/**
 * @import { Declaration, Root } from 'postcss'
 * @import { Rule } from 'stylelint'
 * @typedef {{ ignoreProperties?: Array<string | RegExp>, ignoreKeywords?: Array<string | RegExp>, camelCaseSvgKeywords?: boolean }} KeywordCaseOptions
 */

// @value объявляет локальное имя перед двоеточием или импортирует список имен с alias.
// https://github.com/css-modules/postcss-modules-values
/** @param {Root} root */
const collectValueNames = (root) => {
    /** @type {Set<string>} */
    const names = new Set();

    root.walkAtRules('value', ({ params }) => {
        const nodes = valueParser(params).nodes.filter(
            (node) => node.type !== 'space' && node.type !== 'comment',
        );
        const colon = nodes.findIndex((node) => node.type === 'div' && node.value === ':');

        if (colon !== -1) {
            const name = nodes[0];

            if (name?.type === 'word') {
                names.add(name.value);
            }

            return;
        }

        const from = nodes.findIndex((node) => node.type === 'word' && node.value === 'from');

        if (from === -1) {
            return;
        }

        /** @type {string | undefined} */
        let importedName;

        for (const node of nodes.slice(0, from)) {
            if (node.type === 'word') {
                importedName = node.value;
            }

            if (node.type === 'div' && node.value === ',' && importedName) {
                names.add(importedName);
                importedName = undefined;
            }
        }

        if (importedName) {
            names.add(importedName);
        }
    });

    return names;
};

/** @param {string} value
 * @param {Set<string>} names
 */
const containsValueReference = (value, names) => {
    let found = false;

    valueParser(value).walk((node) => {
        // Имена внутри URL, строк и CSS-функций var()/attr() не являются ссылками @value.
        if (node.type === 'function' && /^(?:url|var|attr)$/i.test(node.value)) {
            return false;
        }

        if (node.type === 'word' && names.has(node.value)) {
            found = true;
        }

        return true;
    });

    return found;
};

const valueRuleName = 'arui-presets-lint/declaration-property-value-no-unknown';

/** @type {Rule<boolean>} */
const valueRule = (primary) => async (root, result) => {
    if (
        !stylelint.utils.validateOptions(result, valueRuleName, {
            actual: primary,
            possible: [true],
        })
    ) {
        return;
    }

    const names = collectValueNames(root);
    const checked = root.clone();

    // Значение @value неизвестно до сборки: как и var(), такая декларация непрозрачна
    // для проверки CSS-грамматики. Остальные декларации проверяет штатное правило.
    checked.walkDecls((declaration) => {
        if (containsValueReference(declaration.value, names)) {
            declaration.remove();
        }
    });

    await stylelint.utils.checkAgainstRule(
        {
            root: checked,
            ruleName: 'declaration-property-value-no-unknown',
            ruleSettings: true,
        },
        (warning) => {
            stylelint.utils.report({
                result,
                ruleName: valueRuleName,
                node: warning.node,
                message: warning.text.replace(' (declaration-property-value-no-unknown)', ''),
                start: { line: warning.line, column: warning.column },
                end: {
                    line: warning.endLine ?? warning.line,
                    column: warning.endColumn ?? warning.column + 1,
                },
            });
        },
    );
};

valueRule.ruleName = valueRuleName;
valueRule.messages = stylelint.utils.ruleMessages(valueRuleName, {});
valueRule.meta = {
    url: 'https://stylelint.io/user-guide/rules/declaration-property-value-no-unknown',
};

const keywordRuleName = 'arui-presets-lint/value-keyword-case';

// Переносим только исправления слов, чтобы не затереть параллельные автофиксы других правил.
/** @param {Declaration} declaration
 * @param {Map<string, string>} changes
 */
const applyKeywordChanges = (declaration, changes) => {
    const parsed = valueParser(declaration.value);

    parsed.walk((node) => {
        if (node.type === 'function' && /^(?:url|var|counter|counters|attr)$/i.test(node.value)) {
            return false;
        }

        if (node.type === 'word') {
            node.value = changes.get(node.value) ?? node.value;
        }

        return true;
    });

    declaration.value = valueParser.stringify(parsed.nodes);
};

/** @type {Rule<'lower', KeywordCaseOptions>} */
const keywordRule = (primary, secondary) => async (root, result) => {
    const options = {
        ...secondary,
        ignoreKeywords: [...(secondary?.ignoreKeywords ?? []), ...collectValueNames(root)],
    };
    /** @type {Declaration[]} */
    const declarations = [];

    root.walkDecls((declaration) => {
        declarations.push(declaration);
    });
    const originalValues = declarations.map((declaration) => declaration.value);

    // Отдельный запуск штатного правила сохраняет его исключения и SVG-нотацию.
    // Он работает с копией CSS и не запускает плагины или конфиг проекта повторно.
    const code = root.toString();
    const fixed = await stylelint.lint({
        code,
        config: { ignoreDisables: true, rules: { 'value-keyword-case': [primary, options] } },
        fix: true,
    });
    /** @type {Map<Declaration, Map<string, string>>} */
    const changes = new Map();
    let index = 0;

    parse(fixed.code ?? code).walkDecls((fixedDeclaration) => {
        const declaration = declarations[index];
        const originalValue = originalValues[index];

        index += 1;

        if (!declaration || originalValue === undefined) {
            return;
        }

        /** @type {string[]} */
        const before = [];
        /** @type {string[]} */
        const after = [];

        valueParser(originalValue).walk((node) => {
            if (node.type === 'word') {
                before.push(node.value);
            }
        });
        valueParser(fixedDeclaration.value).walk((node) => {
            if (node.type === 'word') {
                after.push(node.value);
            }
        });

        /** @type {Map<string, string>} */
        const replacements = new Map();

        for (const [wordIndex, word] of before.entries()) {
            const replacement = after[wordIndex];

            if (replacement && replacement !== word) {
                replacements.set(word, replacement);
            }
        }
        changes.set(declaration, replacements);
    });

    await stylelint.utils.checkAgainstRule(
        { root, ruleName: 'value-keyword-case', ruleSettings: [primary, options] },
        (warning) => {
            const declaration = declarations.find((candidate) => candidate === warning.node);

            if (!declaration) {
                return;
            }

            stylelint.utils.report({
                result,
                ruleName: keywordRuleName,
                node: declaration,
                message: warning.text.replace(' (value-keyword-case)', ''),
                start: { line: warning.line, column: warning.column },
                end: {
                    line: warning.endLine ?? warning.line,
                    column: warning.endColumn ?? warning.column + 1,
                },
                fix: () => applyKeywordChanges(declaration, changes.get(declaration) ?? new Map()),
            });
        },
    );
};

keywordRule.ruleName = keywordRuleName;
keywordRule.messages = stylelint.utils.ruleMessages(keywordRuleName, {});
keywordRule.meta = {
    url: 'https://stylelint.io/user-guide/rules/value-keyword-case',
    fixable: true,
};

export default [
    stylelint.createPlugin(valueRuleName, valueRule),
    stylelint.createPlugin(keywordRuleName, keywordRule),
];
