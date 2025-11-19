/* eslint-disable unicorn/no-null -- Требуется использование null */
import { AST_TOKEN_TYPES, type TSESLint, type TSESTree } from '@typescript-eslint/utils';

// Поддерживаемые типы ESLint директив
const SUPPORTED_DIRECTIVES = [
    'eslint',
    'eslint-disable',
    'eslint-disable-line',
    'eslint-disable-next-line',
    'eslint-enable',
    'eslint-env',
] as const;

type DirectiveKind = (typeof SUPPORTED_DIRECTIVES)[number];

type RuleOptions = {
    ignore: DirectiveKind[];
};

type DirectiveData = {
    kind: DirectiveKind;
    value: string;
    description?: string;
};

function isDirectiveKind(value: string): value is DirectiveKind {
    return SUPPORTED_DIRECTIVES.includes(value as DirectiveKind);
}

function normalizeToFullLine(location: TSESLint.AST.SourceLocation) {
    return {
        start: {
            line: location.start.line,
            column: 0,
        },
        end: location.end,
    };
}

function divideDirectiveComment(value: string) {
    const DESCRIPTION_SEPARATOR: RegExp = /\s-{2,}\s/u;

    const divided = value.split(DESCRIPTION_SEPARATOR);
    const text = divided[0].trim();

    return {
        text,
        description: divided.length > 1 ? divided[1].trim() : undefined,
    };
}

function isValidLineDirective(directiveKind: string, comment: TSESTree.Comment): boolean {
    const LINE_DIRECTIVE_PATTERN: RegExp = /^eslint-disable-(next-)?line$/u;

    const isLineComment = comment.type === AST_TOKEN_TYPES.Line;
    const isLineDirective = LINE_DIRECTIVE_PATTERN.test(directiveKind);

    if (isLineDirective && comment.loc.start.line !== comment.loc.end.line) {
        return false;
    }

    return !isLineComment || isLineDirective;
}

function removeCommentDecorations(line: string): string {
    return line.replace(/^\s*\*\s?/, '').trim();
}

function parseDirectiveComment(comment: TSESTree.Comment): DirectiveData | undefined {
    const DIRECTIVE_PATTERN: RegExp =
        /^(eslint(?:-env|-enable|-disable(?:(?:-next)?-line)?)?)(?:\s|$)/u;

    const commentValue =
        comment.type === AST_TOKEN_TYPES.Block
            ? comment.value
                  .split('\n')
                  .map((line) => removeCommentDecorations(line))
                  .join(' ')
                  .trim()
            : comment.value;

    const { text, description } = divideDirectiveComment(commentValue);
    const match = DIRECTIVE_PATTERN.exec(text);

    if (!match) {
        return undefined;
    }

    const directiveKind = match[1];

    if (!isDirectiveKind(directiveKind)) {
        return undefined;
    }

    if (!isValidLineDirective(directiveKind, comment)) {
        return undefined;
    }

    const directiveValue = text.slice(match.index + directiveKind.length).trim();

    return {
        kind: directiveKind,
        value: directiveValue,
        description,
    };
}

function createSuggestionFix(
    comment: TSESTree.Comment,
    description: string,
): (fixer: TSESLint.RuleFixer) => TSESLint.RuleFix | null {
    return (fixer: TSESLint.RuleFixer) => {
        if (comment.type === AST_TOKEN_TYPES.Line) {
            return fixSingleLineComment(fixer, comment, description);
        }

        if (comment.type === AST_TOKEN_TYPES.Block) {
            return fixBlockComment(fixer, comment, description);
        }

        return null;
    };
}

function formatCommentWithDescription(comment: TSESTree.Comment, description: string): string {
    const trimmedText = comment.value.trim();
    return `${trimmedText} -- ${description}`;
}

function fixSingleLineComment(
    fixer: TSESLint.RuleFixer,
    comment: TSESTree.Comment,
    description: string,
): TSESLint.RuleFix {
    const newCommentText = formatCommentWithDescription(comment, description);
    return fixer.replaceText(comment, `// ${newCommentText}`);
}

function fixBlockComment(
    fixer: TSESLint.RuleFixer,
    comment: TSESTree.Comment,
    description: string,
): TSESLint.RuleFix | null {
    const commentText = comment.value;
    const lines = commentText?.split('\n');

    if (lines.length === 1) {
        const newCommentText = formatCommentWithDescription(comment, description);
        return fixer.replaceText(comment, `/* ${newCommentText} */`);
    }

    return null;
}

/**
 * Коллекция описаний для автодополнений в правилах ESLint.
 * Используется для предоставления пользователю готовых вариантов описаний при нарушении правила
 */
const SUGGESTS_DESCRIPTION = {
    DEBUG: 'Используется временно для отладки',
};

export const requireDescriptionRule: TSESLint.RuleModule<string, [RuleOptions]> = {
    defaultOptions: [
        {
            ignore: [],
        },
    ],
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Требует добавления описаний к ESLint директивам в комментариях',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    ignore: {
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: [...SUPPORTED_DIRECTIVES],
                        },
                        additionalItems: false,
                        uniqueItems: true,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            missingDescription:
                'Директива ESLint без описания. Добавьте описание после "--" чтобы объяснить причину использования.\n' +
                'Примеры:\n' +
                '  // eslint-disable-next-line правило -- причина отключения\n' +
                '  /* eslint-disable правило -- объяснение необходимости */\n' +
                '  /* eslint-env окружение -- описание контекста */\n' +
                '  /*\n' +
                '   * eslint-disable несколько-правил\n' +
                '   * -- комплексное объяснение причины отключения нескольких правил\n' +
                '  */',
            suggestDebug: `Добавить комментарий "${SUGGESTS_DESCRIPTION.DEBUG}"`,
        },
        hasSuggestions: true,
    },
    create(context) {
        const { sourceCode } = context;
        const ignoredDirectives = new Set(context.options[0]?.ignore || []);

        function validateComment(comment: TSESTree.Comment) {
            const directive = parseDirectiveComment(comment);

            if (!directive) {
                return;
            }

            const shouldIgnore = ignoredDirectives.has(directive.kind);
            const hasDescription = Boolean(directive.description);

            if (!shouldIgnore && !hasDescription) {
                context.report({
                    loc: normalizeToFullLine(comment.loc),
                    messageId: 'missingDescription',
                    node: comment,
                    suggest: [
                        {
                            messageId: 'suggestDebug',
                            fix: createSuggestionFix(comment, SUGGESTS_DESCRIPTION.DEBUG),
                        },
                    ],
                });
            }
        }

        return {
            Program() {
                for (const comment of sourceCode.getAllComments()) {
                    validateComment(comment);
                }
            },
        };
    },
};
