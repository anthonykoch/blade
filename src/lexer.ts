import er from 'escape-string-regexp'
// import { createErrorFrame } from './utils'

export const defaultContentTags: [string, string] = ['{{', '}}']
export const defaultRawTags: [string, string] = ['{!!', '!!}']
export const defaultCommentTags: [string, string] = ['{{--', '--}}']
export const defaultEscapedTags: [string, string] = ['{{{', '}}}']

const opentags = [
  'yield',
  'section',
  'show',
  'overwrite',
  'append',
  'parent',
  'extends',
  'if',
  'elseif',
  'else',
  'verbatim',
  'unless',
  'for',
  'foreach',
  'forelse',
  'empty',
  'while',
  'continue',
  'break',
  'include',
  'each',
  'push',
  'stack',
  'prepend',
  'inject',
  'json',
]

const endtags = [
  'show',
  'overwrite',
  'append',
  'stop',
  'endsection',
  'elseif',
  'else',
  'endif',
  'endverbatim',
  'endunless',
  'endfor',
  'endforeach',
  'empty',
  'endforelse',
  'endwhile',
  'endpush',
  'endcomponent',
  'endslot',
]

export const directives = endtags
  .concat(opentags)
  .sort((a, b) => b.length - a.length)

export type Tag = [string, string]

export type Matcher = {
  type: Token
  regex: RegExp
}

interface LexerOptions {
  directives?: string[]
  contentTags?: Tag
  commentTags?: Tag
  rawTags?: Tag
  escapedTags?: Tag
}

export default class Lexer implements Iterable<LexerToken> {
  source: string
  index: number
  regex: RegExp
  stash: LexerToken[]
  contentTags: Tag
  rawTags: Tag
  commentTags: Tag
  escapedTags: Tag
  directiveRegex: RegExp
  commentTagsRegex: RegExp
  contentTagsRegex: RegExp
  rawTagsRegex: RegExp
  escapedTagsRegex: RegExp
  matchers: { [key: string]: Matcher }
  allMatchers: Matcher[]

  static all(
    input: string,
    options: LexerOptions = {
      directives: [],
      contentTags: defaultContentTags,
      rawTags: defaultRawTags,
      commentTags: defaultCommentTags,
      escapedTags: defaultEscapedTags,
    },
  ): LexerToken[] {
    return [...new Lexer(input, options)]
  }

  constructor(
    input: string,
    {
      directives: dirs = [],
      contentTags = defaultContentTags,
      rawTags = defaultRawTags,
      commentTags = defaultCommentTags,
      escapedTags = defaultEscapedTags,
    }: LexerOptions = {
      directives: [],
      contentTags: defaultContentTags,
      rawTags: defaultRawTags,
      commentTags: defaultCommentTags,
      escapedTags: defaultEscapedTags,
    },
  ) {
    this.source = input
    this.index = 0
    this.stash = []

    const regex = [...directives, ...dirs.map(s => er(s))]
      .sort((a, b) => b.length - a.length)
      .join('|')

    this.matchers = {
      directive: {
        type: Token.Directive,
        regex: new RegExp(
          `@(?:(?:${regex})(?:\\(([\\s\\S]*?)\\))|${regex})`,
          'y',
        ),
      },
      comment: {
        type: Token.Comment,
        regex: new RegExp(
          `${er(commentTags[0])}\\s*([\\s\\S]*?)\\s*${er(commentTags[1])}`,
          'y',
        ),
      },
      interpolation: {
        type: Token.Interpolation,
        regex: new RegExp(
          `${er(contentTags[0])}\\s*([\\s\\S]*?)\\s*${er(contentTags[1])}`,
          'y',
        ),
      },
      escapedInterpolation: {
        type: Token.EscapedInterpolation,
        regex: new RegExp(`${er(rawTags[0])}\\s*([\\s\\S]*?)\\s*${er(rawTags[1])}`, 'y'),
      },
      rawInterpolation: {
        type: Token.RawInterpolation,
        regex: new RegExp(`${er(rawTags[0])}\\s*([\\s\\S]*?)\\s*${er(rawTags[1])}`, 'y'),
      },
    }

    this.allMatchers = Object.values(this.matchers)

    this.contentTags = contentTags
    this.rawTags = rawTags
    this.commentTags = commentTags
    this.escapedTags = escapedTags
  }

  lex(): LexerToken | null {
    // console.time('lex')

    // console.log('-MEMES', this.index)
    let token = this.getToken()
    // console.log('MEMES-', this.index)

    // console.timeEnd('lex')

    // if (token == null && !this.eof()) {
    //   token = this.getLastTextToken()
    // }
    // this.index = token.end

    // throw new Error('lol')

    // Check here to see if text token is first

    if (token == null) {
      throw new Error(`unexpected token at ${this.index}`)
    }

    return token
  }

  getToken(): LexerToken | null {
    const start = this.index
    // console.log('start:', start)

    let i = start

    for (; i < this.source.length; i++) {
      for (const { type, regex } of this.allMatchers) {
        regex.lastIndex = i

        const match = this.source.match(regex)

        if (match) {
          const [str, arg] = match
          const end = i + str.length

          const token = {
            type,
            start: i,
            end,
            value: str,
            argument: arg || null,
          }

          this.index = end

          if (i !== start) {
            this.stash.push(token)

            return this.consumeTextToken(start, i)
          }

          return token
        }
      }
    }

    // Note(ak):
    // It's technically not possible for this not to be true at this point. Get's
    // the ending text token
    if (i > start) {
      this.index = i
      return this.consumeTextToken(start, i)
    }

    return null
  }

  consumeTextToken(start: number, end: number): TokenText {
    return {
      type: Token.Text,
      start,
      end,
      value: this.source.substring(start, end),
    }
  }

  lookahead(index: number): LexerToken | null {
    if (index < 0) {
      return null
    }

    const initialStashLength = this.stash.length

    for (let i = 0; i < index + 1; i++) {
      if (i < initialStashLength) {
        continue
      } else if (this.eof()) {
        break
      } else {
        const length = this.stash.length
        const token = this.lex()

        if (token == null) {
          break
        }

        // FIXME: this is hacky af
        if (this.stash.length > length) {
          const last = this.stash[this.stash.length - 1]
          this.stash[this.stash.length - 1] = token
          this.stash.push(last)
        } else {
          this.stash.push(token)
        }
      }
    }

    if (index >= this.stash.length) {
      return null
    }

    return this.stash[index]
  }

  peek(): LexerToken | null {
    return this.lookahead(0)
  }

  nextToken() {
    let token = null

    if (this.stash.length > 0) {
      token = this.stash.pop()
    } else if (this.eof()) {
      token = null
    } else {
      token = this.lex()
    }

    return token
  }

  next(): IteratorResult<LexerToken | null> {
    let token = this.nextToken()

    const done = token == null

    return {
      done,
      value: done ? undefined : token,
    }
  }

  eof() {
    return this.index > this.source.length - 1
  }

  [Symbol.iterator]() {
    return this
  }
}

export enum Token {
  EscapedInterpolation = 'EscapedInterpolation',
  RawInterpolation = 'RawInterpolation',
  Interpolation = 'Interpolation',
  Directive = 'Directive',
  Comment = 'Comment',
  Text = 'Text',
}

export type TokenBase = {
  start: number
  end: number
  value: string
}

export interface TokenDirective extends TokenBase {
  type: Token.Directive
  argument: string | null
}

export interface TokenEscapedInterpolation extends TokenBase {
  type: Token.EscapedInterpolation
  argument: string | null
}

export interface TokenRawInterpolation extends TokenBase {
  type: Token.RawInterpolation
  argument: string | null
}

export interface TokenInterpolation extends TokenBase {
  type: Token.Interpolation
  argument: string | null
}

export interface TokenComment extends TokenBase {
  type: Token.Comment
  argument: string | null
}

export interface TokenText extends TokenBase {
  type: Token.Text
  value: string
}

export type LexerToken =
  | TokenDirective
  | TokenEscapedInterpolation
  | TokenRawInterpolation
  | TokenInterpolation
  | TokenComment
  | TokenText


// const str =
// ` @json lol @section('content') {{ 1 + 2 }} `.repeat(10000 / 4)

// console.log(str.length)

// console.time('lex')
// const tokens = Lexer.all(str)
// console.timeEnd('lex')

// console.log(tokens.length)
