import Lexer, { Token, directives } from '../src/lexer'

describe(`Token`, () => {
  it(`immediately returns done for empty string`, () => {
    expect(Lexer.all(``)).toMatchObject([])
  })

  it(`returns text token for whitespace string`, () => {
    expect(Lexer.all(`\n`)).toMatchObject([
      {
        type: Token.Text,
        value: `\n`,
        start: 0,
        end: 1,
      }
    ])

    expect(Lexer.all(` `)).toMatchObject([{
      type: Token.Text,
      value: ` `,
      start: 0,
      end: 1,
    }])
  })

  it(`consumes tokens in order`, () => {
    expect(Lexer.all(` @json lol @section('content') {{ 1 + 2 }}`)).toMatchObject([
      {
        type: Token.Text,
        value: ` `,
        start: 0,
        end: 1,
      },
      {
        type: Token.Directive,
        value: `@json`,
        start: 1,
        end: 6,
        argument: null
      },
      {
        type: Token.Text,
        value: ` lol `,
        start: 6,
        end: 11,
      },
      {
        type: Token.Directive,
        value: `@section('content')`,
        start: 11,
        end: 30,
        argument: `'content'`,
      },
      {
        type: Token.Text,
        value: ` `,
        start: 30,
        end: 31,
      },
      {
        type: Token.Interpolation,
        value: `{{ 1 + 2 }}`,
        start: 31,
        end: 42,
        argument: `1 + 2`
      },
    ])
  })

  it(`lexes text token for directive looking text`, () => {
    expect(directives).toContain('section')

    directives.forEach(d => {
      expect(Lexer.all(d)).toMatchObject([{
        type: Token.Text,
        start: 0,
        end: d.length,
        value: d,
      }])
    })
  })

  it(`lexes directive token`, () => {
    expect(Lexer.all(`@section`)).toMatchObject([{
      type: Token.Directive,
      argument: null,
      value: `@section`,
      start: 0,
      end: 8,
    }])

    expect(directives).toContain('section')

    directives.forEach(d => {
      expect(Lexer.all(`@${d}`)).toMatchObject([{
        type: Token.Directive,
        value: `@${d}`,
        start: 0,
        end: d.length + 1,
      }])
    })
  })

  it('lexes interpolation', () => {
    expect(Lexer.all(`{{ mist }}`)).toMatchObject([{
      type: Token.Interpolation,
      value: `{{ mist }}`,
      argument: `mist`,
      start: 0,
      end: 10,
    }])
  })
})
