import mongoose from 'mongoose'

import Article from '../../models/Article'

const console = process.console

const publishArticle = function (title, editor, user, callback) {
  Article.findOneAndUpdate({ title, editor, published: false }, {
    $addToSet: { contributors: user },
  }, { new: true }, (err, article) => {
    if (err) {
      return callback(err)
    }

    // Fetch the published article
    Article.findOne({ title, published: true }, (err2, publishedArticle) => {
      if (err2) {
        return callback(err2)
      }

      if (!publishedArticle) {
        return callback()
      }

      // check if the original artical version and fetched article version are same
      if (article.version !== publishedArticle.version) {
        // if different, someone else published before
        return callback('Someone else published the article before you! Please update your content on top of latest version!')
      }

      Article
        .findOne({ title, published: true, editor: 'videowiki-bot' })
        .remove()
        .exec((err) => {
          if (err) {
            return callback(err)
          }

          const clonedArticle = article
          clonedArticle._id = mongoose.Types.ObjectId()
          clonedArticle.isNew = true

          clonedArticle.published = true
          clonedArticle.draft = false
          clonedArticle.editor = 'videowiki-bot'
          clonedArticle.version = new Date().getTime()

          clonedArticle.save((err) => {
            if (err) {
              callback(err)
            } else {
              callback()
            }
          })
        })
    })
  })
}

const cloneArticle = function (title, editor, callback) {
  // Check if an article with the same editor and title exists
  Article.findOne({ title, editor, published: false }, (err, article) => {
    if (err) {
      return callback(err)
    }

    // Fetch the published article
    Article.findOne({ title, published: true }, (err2, publishedArticle) => {
      if (err2) {
        return callback(err2)
      }

      if (!publishedArticle) {
        return callback()
      }

      if (article) { // if yes,
        // check if the original artical version and fetched article version are same
        if (article.version === publishedArticle.version) {
          // if same, use this article
          return callback(null, article)
        }

        // clone the article and add to db
        const clonedArticle = publishedArticle
        clonedArticle._id = mongoose.Types.ObjectId()
        clonedArticle.isNew = true

        clonedArticle.published = false
        clonedArticle.draft = true
        clonedArticle.editor = editor

        clonedArticle.version = publishedArticle.version

        clonedArticle.save((err) => {
          if (err) {
            callback(err)
          } else {
            // if different, clone the article and replace
            Article
              .findOne({ title, editor, published: false, version: article.version })
              .remove()
              .exec()
            callback(null, clonedArticle)
          }
        })
      } else { // if no,
        // clone the article and add to db
        const clonedArticle = publishedArticle
        clonedArticle._id = mongoose.Types.ObjectId()
        clonedArticle.isNew = true

        clonedArticle.published = false
        clonedArticle.draft = true
        clonedArticle.editor = editor

        clonedArticle.version = publishedArticle.version

        clonedArticle.save((err) => {
          if (err) {
            callback(err)
          } else {
            callback(null, clonedArticle)
          }
        })
      }
    })
  })
}

const fetchArticle = function (title, callback) {
  Article.findOneAndUpdate({ title, published: true }, { $inc: { reads: 1 } }, (err, article) => {
    if (err) {
      console.error(err)
      return callback(err)
    }

    callback(null, article)
  })
}

const fetchArticleAndUpdateReads = function (title, callback) {
  Article.findOneAndUpdate({ title, published: true }, { $inc: { reads: 1 } }, (err, article) => {
    if (err) {
      console.error(err)
      return callback(err)
    }

    callback(null, article)
  })
}

const updateMediaToSlide = function (title, slideNumber, editor, { mimetype, filepath }, callback) {
  Article.findOne({ title, editor }, (err, article) => {
    if (err) {
      console.error(err)
      return callback(err)
    }

    if (article) {
      const mimetypeKey = `slides.${slideNumber}.mediaType`
      const filepathKey = `slides.${slideNumber}.media`

      // update slidesHtml slide media
      const mimetypeKeyHtml = `slidesHtml.${slideNumber}.mediaType`
      const filepathKeyHtml = `slidesHtml.${slideNumber}.media`

      Article.update({
        title,
        editor,
      }, {
        $set: {
          [mimetypeKey]: mimetype.split('/')[0],
          [filepathKey]: filepath,

          [mimetypeKeyHtml]: mimetype.split('/')[0],
          [filepathKeyHtml]: filepath,
        },
      }, (err) => {
        if (err) {
          console.error(err)
          return callback(err)
        }

        callback(null, 'Article Updated')
      })
    } else {
      const err = new Error('Article not found!')
      callback(err)
    }
  })
}

export {
  fetchArticle,
  fetchArticleAndUpdateReads,
  updateMediaToSlide,
  cloneArticle,
  publishArticle,
}
