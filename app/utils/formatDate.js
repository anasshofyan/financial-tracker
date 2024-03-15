const { format } = require('date-fns')

const formatDate = (date, formatString = 'd MMMM yyyy') => {
  return format(new Date(date), formatString)
}

module.exports = { formatDate }
