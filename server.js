const db = require('./db')
const logger = require('koa-logger')
const router = require('koa-router')()
const koaBody = require('koa-body')
const koaJson = require('koa-json')
const koaStatic = require('koa-static')
const session = require('koa-session')

const Koa = require('koa')
const app = (module.exports = new Koa())

app.keys = ['some secret hurr']

const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false) */
}

let searchpost = []
let searchuser = []
let length = 0

app.use(logger())
app.use(koaBody())
app.use(session(CONFIG, app))
app.use(koaStatic('./public'))

router
  .get('/list', list)
  .get('/post/:id', show)
  .get('/user/:user', getuser)
  .get('/logined', logined)
  .get('/searchresult', searchresult)
  .post('/login', login)
  .post('/signup', signup)
  .post('/post', create)
  .post('/logout', logout)
  .post('/edit', edit)
  .post('/remove', remove)
  .post('/search', search)

app.use(router.routes())
app.use(koaJson())

db.open()

// post

async function list (ctx) {
  searchpost = []
  searchuser = []
  ctx.body = await db.find('posts')
}

async function show (ctx) {
  const id = ctx.params.id
  const post = await db.findOne('posts', id)
  if (!post) ctx.throw(404, 'invalid post id')
  ctx.body = post
  ctx.status = 200
}

async function create (ctx) {
  let post = JSON.parse(ctx.request.body)
  post.owner = ctx.session.user
  post.id = length
  await db.insert('posts', post)
  length++
  ctx.status = 200
}

async function edit (ctx) {
  let post = JSON.parse(ctx.request.body)
  let target = await db.findOne('posts', post.id)
  target.body = post.body
  await db.update('posts', post.id, target)
  ctx.status = 200
}

async function remove (ctx) {
  let id = JSON.parse(ctx.request.body)
  let target = await db.findOne('posts', id)
  await db.remove(target)
  length--
  ctx.status = 200
}

// user

async function signup (ctx) {
  let user = JSON.parse(ctx.request.body)
  let account = await db.findUser('users', user.account)
  if (account) ctx.status = 401
  else {
    await db.insert('users', user)
    ctx.status = 200
  }
}

async function login (ctx) {
  let user = JSON.parse(ctx.request.body)
  let login = await db.findUser('users', user.account)
  console.log(JSON.stringify(login))
  if (login.account === user.account && login.password === user.password) {
    ctx.session.user = login.name
    console.log(ctx.session.user)
    ctx.status = 200
  } else ctx.status = 401
}

async function logout (ctx) {
  ctx.session.user = null
  ctx.status = 200
}

async function logined (ctx) {
  if (ctx.session !== null) {
    ctx.status = 200
    ctx.body = ctx.session.user
  } else ctx.status = 401
}

async function getuser (ctx) {
  let account = ctx.params.user
  let user = await db.findUser('users', account)
  ctx.body = user
  ctx.status = 200
}

// message

// search

async function search (ctx) {
  let target = JSON.parse(ctx.request.body)
  let users = await db.search('users', {'account': target.index})
  let posts = await db.search('posts', {'title': target.index})
  searchpost = posts
  searchuser = users
  ctx.status = 200
}

async function searchresult (ctx) {
  ctx.body = [searchpost, searchuser]
}

// chat

// pair

if (!module.parent) {
  app.listen(3000)
  console.log('Server run at http://localhost:3000')
}
