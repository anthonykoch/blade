import Lexer, { directives } from '../src/lexer'

function lex(input: string, options?) {
  return new Lexer(input, options).next()
}

describe(`Token`, () => {
  it(`immediately returns done for empty string`, () => {
    //
  })

  it(`returns text token for whitespace string`, () => {
    //
  })

  it(`returns text token for non-things`, () => {
    //
  })

  it(`lexes text token for directive looking text`, () => {
    //
  })

  it(`lexes directive token`, () => {
    //
  })

  it(`does not lexes escaped directive as directive`, () => {
    //
  })

  it('lexes interpolation', () => {
    //
  })
})
