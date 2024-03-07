const sanitizeInput = (input) => {
  const sanitizedInput = input.replace(/[;'"`<>]/g, '')

  return sanitizedInput
}

const validateInput = (input) => {
  const emailRegex = /\S+@\S+\.\S+/
  const isValidEmail = emailRegex.test(input)

  return isValidEmail
}

const cleanAndValidateInput = (input, type) => {
  let cleanedInput = sanitizeInput(input)

  if (type === 'email') {
    if (!validateInput(cleanedInput)) {
      throw new Error('Format email tidak valid')
    }
  }

  return cleanedInput
}

module.exports = {
  cleanAndValidateInput,
}
