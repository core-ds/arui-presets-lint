import { AST_TOKEN_TYPES, type TSESTree } from '@typescript-eslint/utils';

import { SUPPORTED_DIRECTIVES } from '../constants';
import { type DirectiveData, type DirectiveKind } from '../types';

function isDirectiveKind(value: string): value is DirectiveKind {
    return SUPPORTED_DIRECTIVES.includes(value as DirectiveKind);
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

export function parseDirectiveComment(comment: TSESTree.Comment): DirectiveData | undefined {
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
