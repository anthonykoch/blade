import Lexer, { directives, Token } from '../src/lexer'

describe(`Lexer`, () => {
  it(`#lookahead - returns the next token at index 0`, () => {
    expect(new Lexer(`@json lol @section`).lookahead(0)).toMatchObject({
      type: Token.Directive,
      start: 0,
      end: 5,
    })
  })

  it(`#lookahead - returns the next token at index 1`, () => {
    expect(new Lexer(`@json lol @section`).lookahead(1)).toMatchObject({
      type: Token.Text,
      start: 5,
      end: 10,
    })
  })

  it(`#lookahead - returns the next token at index 2`, () => {
    expect(new Lexer(`@json lol @section`).lookahead(2)).toMatchObject({
      type: Token.Directive,
      start: 10,
      end: 18,
    })
  })

  it(`#peek - returns the next token without consuming`, () => {
    const lexer = new Lexer(`@push dive  duck dodge @section`)

    expect(lexer.peek()).toMatchObject({
      type: Token.Directive,
      start: 0,
      end: 5,
    })

    expect(lexer.nextToken()).toMatchObject({
      type: Token.Directive,
      start: 0,
      end: 5,
    })
  })

  it(`implements the iterator protocol`, () => {
    expect(Lexer.all(` @json`)).toMatchObject([
      {
        type: Token.Text,
        value: ` `,
        start: 0,
        end: 1,
      },
      {
        type: Token.Directive,
        value: `@json`,
        argument: null,
        start: 1,
        end: 6,
      },
    ])
  })
})
