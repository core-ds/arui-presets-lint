import { type TSESLint } from '@typescript-eslint/utils';
import assert from 'node:assert/strict';
import { describe, it } from 'vitest';

import {
    createDesignSystemConfig,
    designSystemPlugin,
} from '../../eslint/plugins/design-system/index.js';

type Node = Record<string, unknown>;

function importNode(name: string): Node {
    if (name === '*') return { type: 'ImportNamespaceSpecifier' };
    if (name === 'default') return { type: 'ImportDefaultSpecifier' };
    return { type: 'ImportSpecifier', imported: { type: 'Identifier', name } };
}

function harness(
    rule: string,
    options: unknown[],
    imports: Record<string, { module: string; name: string }>,
    tags?: string,
) {
    const reports: Node[] = [];
    const scope = {
        upper: null,
        set: new Map(
            Object.entries(imports).map(([local, entry]) => [
                local,
                {
                    defs: [
                        {
                            type: 'ImportBinding',
                            parent: { type: 'ImportDeclaration', source: { value: entry.module } },
                            node: importNode(entry.name),
                        },
                    ],
                },
            ]),
        ),
    };
    const symbol = {
        flags: 0,
        getJsDocTags: () =>
            tags === undefined ? [] : [{ name: 'deprecated', text: [{ text: tags }] }],
    };
    const checker = {
        getSymbolAtLocation: () => ({ flags: 2_097_152 }),
        getAliasedSymbol: () => symbol,
    };
    const services =
        tags === undefined
            ? {}
            : {
                  program: { getTypeChecker: () => checker },
                  esTreeNodeToTSNodeMap: { get: (node: unknown) => node },
              };
    const context = {
        options,
        sourceCode: { getScope: () => scope, parserServices: services },
        report: (report: Node) => reports.push(report),
    };
    const definition = designSystemPlugin.rules![rule] as TSESLint.RuleModule<string, unknown[]>;
    const listeners = definition.create(
        context as unknown as Parameters<typeof definition.create>[0],
    );
    const visit = (type: string, node: Node) =>
        (listeners as unknown as Record<string, (node: Node) => void>)[type]?.(node);
    return { reports, scope, symbol, checker, visit };
}

const jsx = (name: string, attributes: Node[] = []) => ({
    type: 'JSXOpeningElement',
    name: { type: 'JSXIdentifier', name },
    attributes,
});
const attr = (name: string, value: unknown) => ({
    type: 'JSXAttribute',
    name: { type: 'JSXIdentifier', name },
    value,
});
const namespaceJsx = (object: string, name: string, attributes: Node[] = []) => ({
    type: 'JSXOpeningElement',
    name: {
        type: 'JSXMemberExpression',
        object: { type: 'JSXIdentifier', name: object },
        property: { name },
    },
    attributes,
});

describe('правила дизайн-системы', () => {
    it('проверяет алиасы named imports и показывает замену', () => {
        const rule = harness(
            'no-deprecated-api',
            [[{ module: 'ds', export: 'Old', replacement: 'New' }]],
            {},
        );
        rule.visit('ImportDeclaration', {
            source: { value: 'ds' },
            specifiers: [
                {
                    type: 'ImportSpecifier',
                    imported: { type: 'Identifier', name: 'Old' },
                    local: { name: 'Alias' },
                },
            ],
        });
        assert.equal(rule.reports.length, 1);
        assert.match((rule.reports[0].data as { suggestion: string }).suggestion, /New/);
    });

    it('проверяет namespace imports и игнорирует совпадение имени другой библиотеки', () => {
        const rule = harness('no-deprecated-api', [[{ module: 'ds', export: 'Old' }]], {
            DS: { module: 'ds', name: '*' },
            Other: { module: 'other', name: '*' },
        });
        rule.visit('JSXOpeningElement', namespaceJsx('DS', 'Old'));
        rule.visit('JSXOpeningElement', namespaceJsx('Other', 'Old'));
        assert.equal(rule.reports.length, 1);
    });

    it('проверяет статическое обращение к namespace и re-export', () => {
        const rule = harness('no-deprecated-api', [[{ module: 'ds', export: 'Old' }]], {
            DS: { module: 'ds', name: '*' },
        });
        rule.visit('MemberExpression', {
            object: { type: 'Identifier', name: 'DS' },
            computed: true,
            property: { type: 'Literal', value: 'Old' },
        });
        rule.visit('ExportNamedDeclaration', {
            source: { value: 'ds' },
            specifiers: [
                {
                    type: 'ExportSpecifier',
                    local: { type: 'Identifier', name: 'Old' },
                },
            ],
        });
        assert.equal(rule.reports.length, 2);
    });

    it('проверяет deprecated props у импортированного алиаса', () => {
        const rule = harness(
            'no-deprecated-props',
            [[{ module: 'ds', component: 'Button', prop: 'old' }]],
            {
                Alias: { module: 'ds', name: 'Button' },
            },
        );
        rule.visit('JSXOpeningElement', jsx('Alias', [attr('old', null)]));
        rule.visit('JSXOpeningElement', jsx('Unrelated', [attr('old', null)]));
        assert.equal(rule.reports.length, 1);
    });

    it('не считает локальный компонент с тем же именем импортом DS', () => {
        const rule = harness(
            'no-deprecated-props',
            [[{ module: 'ds', component: 'Button', prop: 'old' }]],
            {
                Button: { module: 'ds', name: 'Button' },
            },
        );
        rule.scope.set.set('Button', { defs: [] });
        rule.visit('JSXOpeningElement', jsx('Button', [attr('old', null)]));
        assert.equal(rule.reports.length, 0);
    });

    it('проверяет отсутствие, пустоту и наличие доступного имени', () => {
        const rule = harness(
            'require-accessible-name',
            [[{ module: 'ds', component: 'IconButton' }]],
            {
                Icon: { module: 'ds', name: 'IconButton' },
            },
        );
        rule.visit('JSXOpeningElement', jsx('Icon'));
        rule.visit(
            'JSXOpeningElement',
            jsx('Icon', [attr('aria-label', { type: 'Literal', value: ' ' })]),
        );
        rule.visit(
            'JSXOpeningElement',
            jsx('Icon', [attr('aria-label', { type: 'Literal', value: 'Закрыть' })]),
        );
        rule.visit(
            'JSXOpeningElement',
            jsx('Icon', [
                attr('aria-label', {
                    type: 'JSXExpressionContainer',
                    expression: { type: 'Identifier', name: 'label' },
                }),
            ]),
        );
        assert.equal(rule.reports.length, 2);
    });

    it('allowSpread настраивается явно', () => {
        const rule = harness(
            'require-accessible-name',
            [[{ module: 'ds', component: 'Icon', allowSpread: true }]],
            {
                Icon: { module: 'ds', name: 'Icon' },
            },
        );
        rule.visit('JSXOpeningElement', jsx('Icon', [{ type: 'JSXSpreadAttribute' }]));
        assert.equal(rule.reports.length, 0);
    });

    it('читает @deprecated через checker, включая alias и subpath', () => {
        const rule = harness(
            'no-deprecated-components',
            [{}],
            {
                Alias: { module: '@alfalab/core-components/button', name: 'OldButton' },
            },
            'Используйте ButtonV2',
        );
        rule.visit('Program', {});
        rule.visit('JSXOpeningElement', jsx('Alias'));
        assert.equal(rule.reports.length, 1);
        assert.equal(rule.reports[0].messageId, 'deprecatedComponent');
        assert.equal(
            (rule.reports[0].data as { description: string }).description,
            'Используйте ButtonV2',
        );
    });

    it('проверяет arui-private и пропускает библиотеки вне выбранных модулей', () => {
        const rule = harness(
            'no-deprecated-components',
            [{}],
            {
                Private: { module: 'arui-private/legacy', name: 'Legacy' },
                Other: { module: 'some-library', name: 'Legacy' },
            },
            'deprecated',
        );
        rule.visit('JSXOpeningElement', jsx('Private'));
        rule.visit('JSXOpeningElement', jsx('Other'));
        assert.equal(rule.reports.length, 1);
        rule.symbol.getJsDocTags = () => [];
        rule.visit('JSXOpeningElement', jsx('Private'));
        assert.equal(rule.reports.length, 1);
    });

    it('сообщает об отсутствии типовой информации', () => {
        const rule = harness('no-deprecated-components', [{}], {});
        rule.visit('Program', {});
        assert.equal(rule.reports[0].messageId, 'missingTypes');
    });

    it('фабрика включается явно и позволяет отключить typed правило', () => {
        const config = createDesignSystemConfig({ deprecatedComponents: false });
        assert.equal(config.length, 4);
        assert.equal(config[3].rules?.['design-system/no-deprecated-components'], 'off');
    });
});
