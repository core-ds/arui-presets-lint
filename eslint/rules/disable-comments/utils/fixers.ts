/* eslint-disable unicorn/no-null -- Требуется использование null */
import { AST_TOKEN_TYPES, type TSESLint, type TSESTree } from '@typescript-eslint/utils';

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

export function createSuggestionFix(
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

export function createAboveCommentFix(
    comment: TSESTree.Comment,
    description: string,
): (fixer: TSESLint.RuleFixer) => TSESLint.RuleFix | null {
    return (fixer: TSESLint.RuleFixer) => {
        const indent = ' '.repeat(comment.loc.start.column);

        if (comment.type === AST_TOKEN_TYPES.Line) {
            return fixer.insertTextBefore(comment, `// ${description}\n${indent}`);
        }

        if (comment.type === AST_TOKEN_TYPES.Block) {
            return fixer.insertTextBefore(comment, `/* ${description} */\n${indent}`);
        }

        return null;
    };
}
