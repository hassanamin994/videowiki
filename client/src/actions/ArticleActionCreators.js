import _ from 'lodash'

import ArticleAPI from '../apis/ArticleAPI'

import {
  registerAsyncAction as unboundRegisterAsyncAction,
} from './ActionUtils'

const actions = {}

const registerAsyncAction = _.partial(unboundRegisterAsyncAction, actions)

registerAsyncAction(ArticleAPI, 'fetchArticle')

export default actions
