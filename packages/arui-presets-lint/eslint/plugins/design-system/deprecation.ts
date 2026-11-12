import ts from 'typescript';

function describeDeprecation(tags: readonly ts.JSDocTagInfo[]) {
    const tag = tags.find(({ name }) => name === 'deprecated');

    return tag && (tag.text?.map((part) => part.text).join('') ?? '');
}

function getAliasDeprecation(symbol: ts.Symbol, checker: ts.TypeChecker) {
    const description = describeDeprecation(symbol.getJsDocTags(checker));

    if (description !== undefined) {
        return description;
    }

    for (const declaration of symbol.getDeclarations() ?? []) {
        // комментарий перед списком однозначно относится к экспорту с одним элементом
        if (ts.isExportSpecifier(declaration) && declaration.parent.elements.length === 1) {
            const leading = ts.getJSDocDeprecatedTag(declaration.parent.parent);

            if (leading) {
                return ts.getTextOfJSDocComment(leading.comment) ?? '';
            }
        }
    }
}

export function getComponentDeprecation(
    checker: ts.TypeChecker,
    node: ts.JsxOpeningLikeElement,
): string | undefined {
    const name = ts.isPropertyAccessExpression(node.tagName) ? node.tagName.name : node.tagName;
    let symbol = checker.getSymbolAtLocation(name);
    const seen = new Set<ts.Symbol>();

    // eslint-disable-next-line no-bitwise -- SymbolFlags typeScript хранит признаки символа в битовой маске
    while (symbol && symbol.flags & ts.SymbolFlags.Alias) {
        if (seen.has(symbol)) {
            return;
        }

        const description = getAliasDeprecation(symbol, checker);

        if (description !== undefined) {
            return description;
        }

        seen.add(symbol);
        symbol = checker.getImmediateAliasedSymbol(symbol);
    }

    if (!symbol) {
        return;
    }

    const declarations = symbol.getDeclarations();
    const signatures = checker.getTypeOfSymbolAtLocation(symbol, name).getCallSignatures();
    const isOverloadedFunction =
        signatures.length > 1 &&
        signatures.some((signature) => declarations?.includes(signature.getDeclaration()));
    const signatureTags = checker.getResolvedSignature(node)?.getJsDocTags() ?? [];

    const tags = isOverloadedFunction
        ? signatureTags
        : [...symbol.getJsDocTags(checker), ...signatureTags];

    return describeDeprecation(tags);
}
