// This file was generated by lezer-generator. You probably shouldn't edit it.
import {LRParser} from "@lezer/lr"
const spec_identifier = {__proto__:null,repeat:18, end:22, quit:24, exit:26, bells:30, extents:34, rounds:38, import:44, prove:50, break:54}
export const parser = LRParser.deserialize({
  version: 13,
  states: "'UOYQPOOO!WQPO'#DTO!fQPO'#DTOOQO'#DT'#DTOOQO'#DO'#DOOOQO'#Cy'#CyQYQPOOOOQO'#Cf'#CfO#mQPO'#CjO#uQPO'#CnO#zQPO'#CqO$SQPO'#CtO$SQPO'#DTO$_QPO'#CbO$jQPO'#CaOOQO'#C`'#C`O%wQPO'#C`O%|QPO,59oOOQO'#DX'#DXO&UQPO'#DXO$SQPO,58yOOQO-E6w-E6wOOQO,59U,59UOOQO,59W,59WOOQO,59Y,59YOOQO,59],59]OOQO,59`,59`O&ZQPO,59oOOQO,58|,58|O&`QPO,58|O&`QPO,58{O$SQPO,58zO&hQPO1G/ZO&yQPO1G/ZOOQO1G/Z1G/ZO$SQPO,59sOOQO1G.e1G.eOOQO1G.h1G.hOOQO1G.g1G.gOOQO1G.f1G.fOOQO,59f,59fOOQO7+$u7+$uO'RQPO7+$uOOQO-E6x-E6xOOQO1G/_1G/_OOQO<<Ha<<HaP!WQPO'#Cz",
  stateData: "'d~OqOSPOS~OVWOZVO[VO]VOcXOdROfYOgROiZOkROlROsQOx[OzPO~OV]OX]OjcOs`O~OtdOudOVwXZwX[wX]wXcwXdwXfwXgwXiwXkwXlwXowXswXxwXzwX~O_fOagO~OdhO~OgiOsiO~OV]OX]Os`O~OV]OWmOX]O~OvnO}TX!OTXVTXZTX[TX]TXcTXdTXfTXgTXiTXkTXlTXoTXsTXxTXzTXyTX~OtoO~O}pO!OrO~O|sO~OyrO~OV]OX]O~OV]OX]OjcOs`O!OyO~O}zO!OyO~OV]OX]OjcOs`O!O}O~O",
  goto: "#r|PPP}!R!h!vPPP}PPP}P}P}PP}PP}PPPP#Y#`PPP#fPPPP}PPP#jTSOUWbPpz!OQjZQk[QtdQwoR|sb_PZ[dopsz!ORvnd^PZ[dnopsz!OQl]RumQUOReUQqaR{qTTOUQaPVxpz!O",
  nodeNames: "⚠ LineComment MSiril DefinitionStatement AssignmentExpression SequenceExpression RepetitionExpression IntegerLiteral Star repeat ExitStatement end quit exit BellsStatement bells ExtentsStatement extents RoundsStatement rounds TranspositionLiteral ImportStatement import StringLiteral ProveStatement prove PatternLiteral break PlaceNotationLiteral",
  maxTerm: 46,
  skippedNodes: [0,1],
  repeatNodeCount: 2,
  tokenData: "3r~RmX^!|pq!|rs#qvw&Twx(Zxy)}yz*Sz{*X{|&T|}*^!P!Q*c!Q![2c![!]2k!]!^2p!_!`2u!a!b2z!c!}3V#R#S3V#T#o3V#o#p3h#q#r3m#y#z!|$f$g!|#BY#BZ!|$IS$I_!|$I|$JO!|$JT$JU!|$KV$KW!|&FU&FV!|~#RYq~X^!|pq!|#y#z!|$f$g!|#BY#BZ!|$IS$I_!|$I|$JO!|$JT$JU!|$KV$KW!|&FU&FV!|~#tWOr$^st$^tu$^u!b$^!b!c$^!c#O$^#O#P%R#P~$^~$aXOr$^rs$|st$^tu$^u!b$^!b!c$^!c#O$^#O#P%R#P~$^~%ROg~~%U_OY$^YZ$^Zr$^rs$|st$^tu$^uw$^wx$^x!b$^!b!c$^!c#O$^#O#P%R#P#h$^#h#i$^#i~$^~&W_}!O'V!O!P'V!Q!['V!c!k'V!l!q'V!r!z'V!z!{'V!{!|'V!|!}'V#T#]'V#^#c'V#d#l'V#l#m'V#m#n'V#n#o'V~'[_l~}!O'V!O!P'V!Q!['V!c!k'V!l!q'V!r!z'V!z!{'V!{!|'V!|!}'V#T#]'V#^#c'V#d#l'V#l#m'V#m#n'V#n#o'V~(^Z!Q![)P!c!k)P!l!q)P!r!z)P!{!|)P!|!})P#T#])P#^#c)P#d#l)P#m#n)P#n#o)P~)S[wx)x!Q![)P!c!k)P!l!q)P!r!z)P!{!|)P!|!})P#T#])P#^#c)P#d#l)P#m#n)P#n#o)P~)}Od~~*SOx~~*XOy~~*^OW~~*cOv~~*hnP~OY,fZz,fz{,t{|,f|},t}!P,f!P!Q2W!Q![,t![!a,f!a!b,t!b!c,f!c!k,t!k!l,f!l!q,t!q!r,f!r!z,t!z!{,f!{!|,t!|!},t!}#O.|#O#T,f#T#],t#]#^,f#^#c,t#c#d,f#d#l,t#l#m,f#m#n,t#n#o,t#o~,f~,kRP~OY,fZ!P,f!Q~,f~,ynP~OY,fZz,fz{,t{|,f|},t}!P,f!P!Q.w!Q![,t![!a,f!a!b,t!b!c,f!c!k,t!k!l,f!l!q,t!q!r,f!r!z,t!z!{,f!{!|,t!|!},t!}#O.|#O#T,f#T#],t#]#^,f#^#c,t#c#d,f#d#l,t#l#m,f#m#n,t#n#o,t#o~,f~.|Oj~~/RfP~OY,fZ!P,f!Q![0g![!c,f!c!k0g!k!l,f!l!q0g!q!r,f!r!z0g!z!{,f!{!|0g!|!}0g!}#T,f#T#]0g#]#^,f#^#c0g#c#d,f#d#l0g#l#m,f#m#n0g#n#o0g#o~,f~0lhP~OY,fZ!P,f!Q![0g![!c,f!c!k0g!k!l,f!l!q0g!q!r,f!r!z0g!z!{,f!{!|0g!|!}0g!}#P,f#P#Q,t#Q#T,f#T#]0g#]#^,f#^#c0g#c#d,f#d#l0g#l#m,f#m#n0g#n#o0g#o~,f~2]QP~OY2WZ~2W~2hPV~!Q![2c~2pO|~~2uO}~~2zOt~~2}P!_!`3Q~3VOu~~3[Ss~!Q![3V!c!}3V#R#S3V#T#o3V~3mOz~~3rO!O~",
  tokenizers: [0],
  topRules: {"MSiril":[0,2]},
  specialized: [{term: 35, get: value => spec_identifier[value] || -1}],
  tokenPrec: 0
})
