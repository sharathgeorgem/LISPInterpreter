// Parse and Evaluate function
function parseAndEval (data) {
  // To return symbols
  if (data.startsWith('\'')) return clearSpace(data.slice(1))
  if (data.startsWith('(quote')) return clearSpace(data.slice(6))
  if (parseNumber(data)) return parseNumber(data)[0]
  // To evaluate expressions
  if (!data.startsWith('(')) return null
  data = clearSpace(data.slice(1))
  if (data.startsWith(')')) return '()'
  // Check for if
  if (data.startsWith('if')) {
    data = data.slice(2)
    data = clearSpace(data)
    data = data.slice
    let conseq = parseAndEval(data)
    if (conseq !== null) return conseq  
  }
  // Check for define
  if (data.startsWith('define')) {
    data = data.slice(6)
    data = clearSpace(data)
    let key = data.slice(data.indexOf(' ') - 1)
    data = clearSpace(data.slice(key.length))
    let value = data.slice(data.indexOf(' ') - 1)
    environment.key = value
    return ''
  }
  let check = data.charAt(0)
  data = data.slice(1)
  if (environment.hasOwnProperty(check)) {
    let arr = []
    while (!data.startsWith(')')) {
      data = clearSpace(data)
      // check for two or more operation nesting
      if (data.startsWith('(')) {
        let replace = parseAndEval(data)
        data = data.slice((data.indexOf(')')) + 1)
        data = replace + ' ' + data
      }
      data = clearSpace(data)
      // check for data begins with variable
      if (/^[A-Za-z]+/.exec(data)) {
        let varName = /^[A-Za-z]+/.exec(data)[0]
        console.log(varName)
        let replaceName = environment[varName]
        data = data.replace(varName, replaceName)
      }
      data = parseNumber(data)
      arr.push(data[0])
      data = clearSpace(data[1])
    }
    return environment[check](arr)
  } return null
}

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
  }
}
function parseNumber (data) {
  let num = /^[-]?[0-9]+(\.[0-9]+(?:[Ee][+-]?[0-9]+)?)?/.exec(data)
  if (num) return [Number(num[0]), data.slice(num[0].length)]
  return null
}
function clearSpace (data) {
  let first = data.search(/\S/)
  if (first === -1) return ''
  return data.slice(first)
}
console.log(parseAndEval('(+(* 6 6) 7 7)'))
