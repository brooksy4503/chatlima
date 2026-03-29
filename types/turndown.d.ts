declare module "turndown" {
  interface TurndownServiceOptions {
    headingStyle?: "setext" | "atx";
    hr?: string;
    bulletListMarker?: "-" | "*" | "+";
    codeBlockStyle?: "indented" | "fenced";
    fence?: string;
    emDelimiter?: "_" | "*";
    strongDelimiter?: "__" | "**";
    linkStyle?: "inlined" | "referenced";
    linkReferenceStyle?: "full" | "collapsed" | "shortcut";
    br?: string;
    preformattedCode?: boolean;
  }

  export default class TurndownService {
    constructor(options?: TurndownServiceOptions);
    turndown(input: string | Node): string;
  }
}
