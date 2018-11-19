const logger = require('koa-logger')
const router = require('koa-router')()
const koaBody = require('koa-body')
const koaJson = require('koa-json')
const koaStatic = require('koa-static')

const Koa = require('koa')
const app = (module.exports = new Koa())

const posts = []
const users = []
let account = false

app.use(logger())

app.use(koaBody())
app.use(koaStatic('./public'))

router
  .get('/list', list)
  .get('/post/:id', show)
  .post('/login', login)
  .post('/signup', signup)
  .post('/post', create)
  .post('/logout', logout)

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
  post.owner = account
  console.log(post)
  ctx.status = 200
}

// user

async function signup (ctx) {
  let user = JSON.parse(ctx.request.body)
  for (let i of users) {
    if (user.account === i.account) {
      ctx.status = 401
      return
    }
  }
  users.push(user)
  ctx.status = 200
}

async function login (ctx) {
  let user = JSON.parse(ctx.request.body)
  for (let i of users) {
    if (user.account === i.account && user.password === i.password) {
      ctx.status = 200
      account = user.account
      return
    }
  }
  ctx.status = 401
}

async function logout (ctx) {
  let user = JSON.parse(ctx.request.body)
  for (let i of users) {
    if (user.account === i.account) {
      account = false
      ctx.status = 200
      return
    }
  }
}

// message

// search

// chat

// pair

if (!module.parent) {
  app.listen(3000)
  console.log('Server run at http://localhost:3000')
}
