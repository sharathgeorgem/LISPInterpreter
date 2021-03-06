// Parse and Evaluate function
function parseAndEval (data, context) {
  if (context === undefined) return parseAndEval(data, new Context(environment))
  // Check for begin
  if (data.startsWith('(begin')) {
    data = data.slice(7)
    let definition = data.substr(0, data.indexOf(')') + 1)
    parseAndEval(definition)
    data = data.slice(definition.length)
    data = clearSpace(data)
    return parseAndEval(data)
  }
  // Check for quote
  if (data.startsWith('\'')) return clearSpace(data.slice(1))
  if (data.startsWith('(quote')) return clearSpace(data.slice(6))
  if (parseNumber(data)) return parseNumber(data)[0]
  // To evaluate expressions
  if (!data.startsWith('(')) return null
  data = clearSpace(data.slice(1))
  if (data.startsWith(')')) return 'Not a syntactically valid expression'
  // Check for if
  if (data.startsWith('if')) {
    data = data.slice(2)
    data = clearSpace(data)
    // To check test condition
    let test = data.substring(0, data.indexOf(')') + 1)
    data = data.slice(data.indexOf(')') + 1)
    data = clearSpace(data)
    // The consequent of 'if'
    let consequent = data.substring(0, data.indexOf(')') + 1)
    data = data.slice(data.indexOf(')') + 1)
    data = clearSpace(data)
    // The alternative of 'if'
    let alt = data.substring(0, data.indexOf(')') + 1)
    data = data.slice(data.indexOf(')') + 1)
    data = clearSpace(data)
    test = parseAndEval(test)
    if (test) return parseAndEval(consequent)
    else return parseAndEval(alt)
  }
  // Check for define
  if (data.startsWith('define')) {
    data = data.slice(6)
    data = clearSpace(data)
    var key = data.substring(0, data.indexOf(' '))
    data = clearSpace(data.slice(key.length))
    // Check for lambda
    if (data.startsWith('(lambda')) {
      var localScope = Object.create(null)
      data = data.slice(7)
      data = clearSpace(data)
      var localVar = data.substring(0, data.indexOf(' '))
      localVar = localVar.replace(/[()]/g, '')
      localScope[localVar] = null
      console.log(localScope)
      data = data.slice(data.indexOf(' '))
      data = clearSpace(data)
      data = data.slice(0, -2)
      console.log(data)
      let value = function (localScope, scope) {
        return parseAndEval(String(data), new Context(localScope, scope))
      }
      context.scope[key] = value
      console.log(context)
      return ''
    }
    let value = data.substring(0, data.lastIndexOf(')'))
    data = clearSpace(data.slice(value.length))
    context.scope[key] = value
    return ''
  }
  // Check for set
  if (data.startsWith('set!')) {
    data = data.slice(4)
    data = clearSpace(data)
    let symbol = data.substr(0, data.indexOf(' '))
    data = data.slice(symbol.length)
    data = clearSpace(data)
    let value = data.substr(0, data.indexOf(')'))
    if (context.get(symbol)) context.get[symbol] = value
    else return 'Symbol does not exist'
  }
  let check = data.substr(0, data.indexOf(' '))
  data = data.slice(check.length)
  if (context.get(check)) {
    let arr = []
    while (!data.startsWith(')')) {
      data = clearSpace(data)
      // Evaluate nested expressions
      if (data.startsWith('(')) {
        let replace = parseAndEval(data)
        data = data.slice((data.indexOf(')')) + 1)
        data = replace + ' ' + data
      }
      data = clearSpace(data)
      // check for data begins with variable
      if (/^[A-Za-z]+/.exec(data)) {
        let varName = /^[A-Za-z]+/.exec(data)[0]
        // Check with context
        let replaceName = context.get(varName)
        data = data.replace(varName, replaceName)
      }
      data = clearSpace(data)
      data = parseNumber(data)
      arr.push(data[0])
      data = clearSpace(data[1])
    }
    return environment[check](arr, context.scope)
  } return null
}
// Environment variable
var environment = {
  '+': (arr) => {
    return arr.reduce((accumulator, currentValue) => {
      return accumulator + currentValue
    })
  },
  '-': (arr) => {
    return arr.reduce((accumulator, currentValue) => {
      return (accumulator - currentValue)
    })
  },
  '*': (arr) => {
    return arr.reduce((accumulator, currentValue) => {
      return (accumulator * currentValue)
    })
  },
  '/': (arr) => {
    return arr.reduce((accumulator, currentValue) => {
      return (accumulator / currentValue)
    })
  },
  '%': (arr) => {
    return arr.reduce((accumulator, currentValue) => {
      return (accumulator % currentValue)
    })
  },
  '>': (arr) => {
    return arr.reduce((accumulator, currentValue) => {
      return (accumulator > currentValue)
    })
  },
  '<': (arr) => {
    return arr.reduce((accumulator, currentValue) => {
      return (accumulator < currentValue)
    })
  },
  'pi': 3.14,
  'r': 12
}
// Context constructor
var Context = function (scope, parent) {
  this.scope = scope
  this.parent = parent
  this.get = function (identifier) {
    if (identifier in this.scope) {
      return this.scope[identifier]
    } else if (this.parent !== undefined) {
      return this.parent.get(identifier)
    }
  }
}
// Number parser
function parseNumber (data) {
  let num = /^[-]?[0-9]+(\.[0-9]+(?:[Ee][+-]?[0-9]+)?)?/.exec(data)
  if (num) return [Number(num[0]), data.slice(num[0].length)]
  return null
}
// Delete space
function clearSpace (data) {
  let first = data.search(/\S/)
  if (first === -1) return ''
  return data.slice(first)
}
console.log(parseAndEval('(set! r (* r r))'))

