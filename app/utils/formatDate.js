const { format } = require('date-fns')

const formatDate = (date) => {
  return format(new Date(date), 'd MMMM yyyy')
}

module.exports = { formatDate }
