const logger = require('koa-logger')
const router = require('koa-router')()
const koaBody = require('koa-body')
const koaJson = require('koa-json')
const koaStatic = require('koa-static')

const Koa = require('koa')
const app = (module.exports = new Koa())

const posts = []

app.use(logger())

app.use(koaBody())
app.use(koaStatic('./public'))

router.get('/list', list).get('/post/:id', show).post('/post', create)

app.use(router.routes())
app.use(koaJson())

// post

async function list (ctx) {
  ctx.body = posts
}

async function show (ctx) {
  const id = ctx.params.id
  const post = posts[id]
  if (!post) ctx.throw(404, 'invalid post id')
  ctx.body = post
}

async function create (ctx) {
  var post = JSON.parse(ctx.request.body)
  const id = posts.push(post) - 1
  post.created_at = new Date()
  post.id = id
}

if (!module.parent) {
  app.listen(3000)
  console.log('Server run at http://localhost:3000')
}
