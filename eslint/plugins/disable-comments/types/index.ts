import { type SUPPORTED_DIRECTIVES } from '../constants/index.js';

export type DirectiveKind = (typeof SUPPORTED_DIRECTIVES)[number];

export type RuleOptions = {
    ignore: DirectiveKind[];
};

export type DirectiveData = {
    kind: DirectiveKind;
    value: string;
    description?: string;
};
