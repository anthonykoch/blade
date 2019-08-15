import Lexer, { directives } from '../src/lexer'

function lex(input: string, options?) {
  return new Lexer(input, options).next()
}

describe.skip(`Token`, () => {
  it(`immediately returns done for empty string`, () => {
    expect(lex(``).done).toBeTruthy()
  })

  it(`returns text token for whitespace string`, () => {
    expect(lex(`\n`).value).toMatchObject({
      type: 'text',
      start: 0,
      end: 1,
    })
    expect(lex(` `).value).toMatchObject({
      type: 'text',
      start: 0,
      end: 1,
    })
  })

  it(`returns text token for non-things`, () => {
    expect(directives).toContain('section')

    directives.forEach(d => {
      expect(lex(d).value).toMatchObject({
        type: 'text',
        start: 0,
        end: d.length,
      })
      expect(lex(d).done).toBeFalsy()
    })
  })

  it(`lexes text token for directive looking text`, () => {
    expect(directives).toContain('section')

    directives.forEach(d => {
      expect(lex(d).value).toMatchObject({
        type: 'text',
        start: 0,
        end: d.length,
      })
      expect(lex(d).done).toBeFalsy()
    })
  })

  it(`lexes directive token`, () => {
    expect(lex(`@section`).value).toMatchObject({
      type: 'directive',
      name: 'section',
      start: 0,
      end: 8,
    })

    expect(directives).toContain('section')

    directives.forEach(d => {
      expect(lex(`@${d}`).value).toMatchObject({
        type: 'directive',
        name: d,
        start: 0,
        end: d.length + 1,
      })
      expect(lex(`@${d}`).done).toBeFalsy()
    })
  })

  it(`does not lexes escaped directive as directive`, () => {
    // expect(lex(`\\@section`).value).toMatchObject({
    //   type: 'text',
    //   name: 'section',
    //   start: 0,
    //   end: 8,
    // })
    // expect(directives).toContain('section')
    // directives.forEach(d => {
    //   expect(lex(`@${d}`).value).toMatchObject({
    //     type: 'directive',
    //     name: d,
    //     start: 0,
    //     end: d.length + 1,
    //   })
    //   expect(lex(`@${d}`).done).toBeFalsy()
    // })
  })

  it('lexes interpolation', () => {
    //   expect(lex(`{{ }}`).value).toMatchObject({
    //     type: 'interpolation',
    //     start: 0,
    //     end: d.length + 1,
    //   })
  })
})
