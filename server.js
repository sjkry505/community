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
let index = 0

app.use(logger())

app.use(koaBody())
app.use(koaStatic('./public'))

router
  .get('/list', list)
  .post('/login', login)
  .post('/signup', signup)
  .post('/post', create)
  .post('/logout', logout)
  .post('/edit', edit)
  .post('/remove', remove)

app.use(router.routes())
app.use(koaJson())

// post

async function list (ctx) {
  ctx.body = posts
}

async function create (ctx) {
  let post = JSON.parse(ctx.request.body)
  const id = index
  post.created_at = new Date()
  post.id = id
  post.owner = account
  posts.push(post)
  index++
  ctx.status = 200
}

async function edit (ctx) {
  let post = JSON.parse(ctx.request.body)
  for (let i of posts) {
    if (post.id === i.id) {
      i.body = post.body
    }
  }
  console.log(posts)
  ctx.status = 200
}

async function remove (ctx) {
  let post = JSON.parse(ctx.request.body)
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].id === post.id) {
      posts.splice(i, 1)
    }
  }
  for (let i = post.id; i < posts.length; i++) {
    posts[i].id = posts[i].id - 1
  }
  index--
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
