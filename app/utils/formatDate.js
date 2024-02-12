const { format } = require('date-fns')
const { id } = require('date-fns/locale')

const formatDate = (date) => {
  return format(new Date(date), 'EEEE, d MMMM yyyy', { locale: id })
}

module.exports = { formatDate }
