import { type TSESLint } from '@typescript-eslint/utils';

import { MESSAGES, SUPPORTED_DIRECTIVES } from '../constants';
import { type RuleOptions } from '../types';
import { buildSuggestions, CommentValidator } from '../utils';

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
        messages: MESSAGES,
        hasSuggestions: true,
    },
    create(context) {
        const { sourceCode } = context;
        const ignoredDirectives = context.options[0]?.ignore || [];
        const allComments = sourceCode.getAllComments();

        const validator = new CommentValidator(ignoredDirectives, allComments);

        return {
            Program() {
                for (const comment of allComments) {
                    const validationResult = validator.validate(comment);

                    if (validationResult.needsReport) {
                        context.report({
                            loc: {
                                start: {
                                    line: comment.loc.start.line,
                                    column: 0,
                                },
                                end: comment.loc.end,
                            },
                            messageId: validationResult.messageId,
                            node: comment,
                            suggest: buildSuggestions(comment),
                        });
                    }
                }
            },
        };
    },
};
