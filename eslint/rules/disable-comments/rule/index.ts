import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';

import { MESSAGE_IDS, MESSAGES, SUGGESTS_DESCRIPTION, SUPPORTED_DIRECTIVES } from '../constants';
import { type RuleOptions } from '../types';
import {
    createAboveCommentFix,
    createSuggestionFix,
    getPreviousComment,
    isAdjacentComment,
    parseDirectiveComment,
} from '../utils';

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
        const ignoredDirectives = new Set(context.options[0]?.ignore || []);
        const allComments = sourceCode.getAllComments();

        function validateComment(comment: TSESTree.Comment) {
            const directive = parseDirectiveComment(comment);

            if (!directive) {
                return;
            }

            const shouldIgnore = ignoredDirectives.has(directive.kind);
            const hasInlineDescription = Boolean(directive.description);

            const previousComment = getPreviousComment(allComments, comment);
            const hasAboveComment =
                previousComment &&
                isAdjacentComment(previousComment, comment) &&
                !parseDirectiveComment(previousComment);

            if (!shouldIgnore && !hasInlineDescription && !hasAboveComment) {
                context.report({
                    loc: {
                        start: {
                            line: comment.loc.start.line,
                            column: 0,
                        },
                        end: comment.loc.end,
                    },
                    messageId: MESSAGE_IDS.missingDescription,
                    node: comment,
                    suggest: [
                        {
                            messageId: MESSAGE_IDS.suggestDebug,
                            fix: createSuggestionFix(comment, SUGGESTS_DESCRIPTION.DEBUG),
                        },
                        {
                            messageId: MESSAGE_IDS.suggestAboveComment,
                            fix: createAboveCommentFix(comment, SUGGESTS_DESCRIPTION.ABOVE_COMMENT),
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
