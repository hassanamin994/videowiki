import express from 'express'
import { search, getPageContentHtml } from '../../controllers/wiki'

const router = express.Router()

module.exports = () => {
  router.get('/search', (req, res) => {
    const { searchTerm, limit } = req.query

    if (!searchTerm) {
      return res.send('Invalid searchTerm!')
    }

    search(searchTerm, limit, (err, results) => {
      if (err) {
        console.log(err)
        return res.send('Error while searching!')
      }

      const searchResults = results.map((result) => {
        console.log('')
        return {
          title: result,
          description: '',
        }
      })

      return res.json({ searchResults })
    })
  })

  router.get('/', (req, res) => {
    const { title } = req.query

    if (!title) {
      return res.send('Invalid wiki title!')
    }

    getPageContentHtml(title, (err, result) => {
      if (err) {
        console.log(err)
        return res.send('Error while fetching content!')
      }

      return res.send(result)
    })
  })

  return router
}
