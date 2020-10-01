import { parser } from './lezer-msiril';
import { LezerSyntax, indentNodeProp, continuedIndent, foldNodeProp } from '@codemirror/next/syntax';
import { styleTags } from '@codemirror/next/highlight';

const msirilSyntax = LezerSyntax.define(parser.withProps(indentNodeProp.add({
    Declaration: continuedIndent()
}), styleTags({
    "end quit exit bells extends rounds import prove repeat break": "keyword",
    BellsStatement: "keyword",
    PlaceNotationLiteral: "regexp",
    PatternLiteral: "regexp",
    IntegerLiteral: "number",
    StringLiteral: "string",
    LineComment: "lineComment",
    Star: "modifier",
    "=": "punctuation definition",
    "( )": "paren",
    "[ ]": "squareBracket",
    "{ }": "brace",
    ", ;": "separator"
})), {
    languageData: {
        closeBrackets: { brackets: ["(", "{", "'", '"'] },
        commentTokens: { line: "//" }
    }
});

/// Returns an extension that installs the syntax provider.
function msiril() {
    return msirilSyntax;
}

export { msiril, msirilSyntax };
