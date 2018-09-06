// Parse and Evaluate function
function parseAndEval (data, context) {
  if (context === undefined) return parseAndEval(data, new Context(environment))
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
    let key = data.substring(0, data.indexOf(' '))
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
    }
    let value = data.substring(0, data.lastIndexOf(')'))
    data = clearSpace(data.slice(value.length))
    environment[key] = value
    return ''
  }
  let check = data.substr(0, data.indexOf(' '))
  data = data.slice(check.length)
  if (environment.hasOwnProperty(check)) {
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
        let replaceName
        // Check with context
        if (varName in context.scope) replaceName = context.get(varName)
        else if (varName in context.parent) replaceName = context.get(varName)
        data = data.replace(varName, replaceName)
        console.log(data)
      }
      data = clearSpace(data)
      data = parseNumber(data)
      arr.push(data[0])
      data = clearSpace(data[1])
    }
    return environment[check](arr)
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
  'r': 100,
  'circle-area': (parameter) => {
    let localScope = Object.create(null)
    localScope['r'] = parameter
    console.log(localScope)
    return parseAndEval('(* pi(* r r))', localScope)
  }
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
// Remove space
function clearSpace (data) {
  let first = data.search(/\S/)
  if (first === -1) return ''
  return data.slice(first)
}
console.log(parseAndEval('(* pi r)'))
