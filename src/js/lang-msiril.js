import { parser } from './lezer-msiril';
import { LezerLanguage, indentNodeProp, foldNodeProp, continuedIndent } from '@codemirror/language';
import { styleTags, tags } from '@codemirror/highlight';

const msirilSyntax = LezerLanguage.define( {
    parser: parser.configure( {
        props: [
            indentNodeProp.add( {
                Declaration: continuedIndent()
            } ),
            foldNodeProp.add({}),
            styleTags( {
                "end quit exit bells extends rounds import prove repeat break": tags.keyword,
                BellsStatement: tags.keyword,
                PlaceNotationLiteral: tags.regexp,
                PatternLiteral: tags.regexp,
                IntegerLiteral: tags.number,
                StringLiteral: tags.string,
                LineComment: tags.lineComment,
                Star: tags.modifier,
                "=": tags.definitionOperator,
                "( )": tags.paren,
                "[ ]": tags.squareBracket,
                "{ }": tags.brace,
                ", ;": tags.separator
            } )
        ]
    } ),
    languageData: {
        closeBrackets: { brackets: ["(", "{", "'", '"'] },
        commentTokens: { line: "//" }
    }
} );

/// Returns an extension that installs the syntax provider.
function msiril() {
    return msirilSyntax;
}

export { msiril, msirilSyntax };
