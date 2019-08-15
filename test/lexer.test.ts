import Lexer, { directives } from '../src/lexer'

describe(`Lexer`, () => {
  it.only(`#getToken - returns directive, interpolation, and text tokens`, () => {
    console.time('lexer')
    new Lexer(` @json lol @section`).next()
    console.timeEnd('lexer')

    // expect(new Lexer(`some text`).getToken()).toMatchObject({
    //   type: 'text',
    //   start: 0,
    //   end: 9,
    // })

    // expect(new Lexer(`@json`).getToken()).toMatchObject({
    //   type: 'directive',
    //   start: 0,
    //   end: 5,
    // })
  })

  it(`does not match non-directive looking directives`, () => {
    expect(new Lexer(`@kappa`).getToken()).toMatchObject({
      type: 'text',
      start: 0,
      end: 6,
    })
  })

  it(`#lookahead - returns the next token at index 0`, () => {
    expect(new Lexer(`@json lol @section`).lookahead(0)).toMatchObject({
      type: 'directive',
      start: 0,
      end: 5,
    })
  })

  it(`#lookahead - returns the next token at index 1`, () => {
    expect(new Lexer(`@json lol @section`).lookahead(1)).toMatchObject({
      type: 'text',
      start: 5,
      end: 10,
    })
  })

  it(`#lookahead - returns the next token at index 2`, () => {
    expect(new Lexer(`@json lol @section`).lookahead(2)).toMatchObject({
      type: 'directive',
      start: 10,
      end: 18,
    })
  })

  it(`#peek - returns the next token without consuming`, () => {})

  it(`implements the iterator protocol`, () => {})
})
