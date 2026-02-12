import { type TSESTree } from '@typescript-eslint/utils';

import { MESSAGE_IDS, SUGGESTS_DESCRIPTION } from '../constants';

import { createAboveCommentFix, createSuggestionFix } from './fixers';

export function buildSuggestions(comment: TSESTree.Comment) {
    return [
        {
            messageId: MESSAGE_IDS.suggestDebug,
            fix: createSuggestionFix(comment, SUGGESTS_DESCRIPTION.DEBUG),
        },
        {
            messageId: MESSAGE_IDS.suggestAboveComment,
            fix: createAboveCommentFix(comment, SUGGESTS_DESCRIPTION.ABOVE_COMMENT),
        },
    ];
}
