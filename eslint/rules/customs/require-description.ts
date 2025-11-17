import { AST_TOKEN_TYPES, type TSESLint, type TSESTree } from '@typescript-eslint/utils';

function toForceLocation(location: TSESLint.AST.SourceLocation) {
    return {
        start: {
            line: location.start.line,
            column: 0,
        },
        end: location.end,
    };
}

function divideDirectiveComment(value: string) {
    const divided = value.split(/\s-{2,}\s/u);
    const text = divided[0].trim();

    return {
        text,
        description: divided.length > 1 ? divided[1].trim() : undefined,
    };
}

function parseDirectiveComment(comment: TSESTree.Comment) {
    const DIRECTIVE_PATTERN =
        /^(eslint(?:-env|-enable|-disable(?:(?:-next)?-line)?)?|exported|globals?)(?:\s|$)/u;
    const LINE_COMMENT_PATTERN = /^eslint-disable-(next-)?line$/u;

    const { text, description } = divideDirectiveComment(comment.value);
    const match = DIRECTIVE_PATTERN.exec(text);

    if (!match) {
        return;
    }

    const directiveText = match[1];
    const lineCommentSupported = LINE_COMMENT_PATTERN.test(directiveText);

    if (comment.type === AST_TOKEN_TYPES.Line && !lineCommentSupported) {
        return;
    }

    if (lineCommentSupported && comment.loc.start.line !== comment.loc.end.line) {
        return;
    }

    const directiveValue = text.slice(match.index + directiveText.length);

    return {
        kind: directiveText,
        value: directiveValue.trim(),
        description,
    };
}

export const requireDescriptionRule: TSESLint.RuleModule<
    string,
    [
        {
            ignore: string[];
        },
    ]
> = {
    defaultOptions: [
        {
            ignore: [],
        },
    ],
    meta: {
        type: 'suggestion',
        docs: {
            description: 'require include descriptions in ESLint directive-comments',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    ignore: {
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: [
                                'eslint',
                                'eslint-disable',
                                'eslint-disable-line',
                                'eslint-disable-next-line',
                                'eslint-enable',
                                'eslint-env',
                                'exported',
                                'global',
                                'globals',
                            ],
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
                'Unexpected undescribed directive comment. Include descriptions to explain why the comment is necessary.',
        },
    },
    create(context) {
        const { sourceCode } = context;
        const ignores = new Set(context.options[0]?.ignore || []);

        return {
            Program() {
                for (const comment of sourceCode.getAllComments()) {
                    const directiveComment = parseDirectiveComment(comment);

                    if (
                        directiveComment !== undefined &&
                        !ignores.has(directiveComment.kind) &&
                        !directiveComment.description
                    ) {
                        context.report({
                            loc: toForceLocation(comment.loc),
                            messageId: 'missingDescription',
                        });
                    }
                }
            },
        };
    },
};
