import { type TSESTree } from '@typescript-eslint/utils';

import { MESSAGE_IDS } from '../constants';
import { type DirectiveData } from '../types';

import {
    getPreviousComment,
    isAdjacentComment,
    isValidDescription,
    parseDirectiveComment,
    validateAboveComment,
} from './comment-parser';

export class CommentValidator {
    private ignoredDirectives: Set<string>;
    private allComments: TSESTree.Comment[];

    constructor(ignoredDirectives: string[], allComments: TSESTree.Comment[]) {
        this.ignoredDirectives = new Set(ignoredDirectives);
        this.allComments = allComments;
    }

    private getMeaningfulAboveComment(comment: TSESTree.Comment): TSESTree.Comment | undefined {
        const previousComment = getPreviousComment(this.allComments, comment);

        if (
            previousComment &&
            isAdjacentComment(previousComment, comment) &&
            !parseDirectiveComment(previousComment) &&
            validateAboveComment(previousComment)
        ) {
            return previousComment;
        }

        return undefined;
    }

    validate(comment: TSESTree.Comment): {
        needsReport: boolean;
        messageId: string;
        directive?: DirectiveData;
    } {
        const directive = parseDirectiveComment(comment);

        if (!directive) {
            return { needsReport: false, messageId: '' };
        }

        const shouldIgnore = this.ignoredDirectives.has(directive.kind);
        const hasValidInlineDescription = directive.description
            ? isValidDescription(directive.description)
            : false;

        const hasValidAboveComment = Boolean(this.getMeaningfulAboveComment(comment));

        if (shouldIgnore || hasValidInlineDescription || hasValidAboveComment) {
            return { needsReport: false, messageId: '', directive };
        }

        const aboveComment = getPreviousComment(this.allComments, comment);

        let messageId = MESSAGE_IDS.missingDescription;

        const hasInvalidInlineDescription =
            directive.description && !isValidDescription(directive.description);

        const hasInvalidAboveComment =
            aboveComment &&
            isAdjacentComment(aboveComment, comment) &&
            !parseDirectiveComment(aboveComment) &&
            !validateAboveComment(aboveComment);

        if (hasInvalidInlineDescription || hasInvalidAboveComment) {
            messageId = MESSAGE_IDS.invalidDescription;
        }

        return { needsReport: true, messageId, directive };
    }
}
