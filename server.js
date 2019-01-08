const db = require('./db')
const Koa = require('koa')
const app = (module.exports = new Koa())
const logger = require('koa-logger')
const router = require('koa-router')()
const koaBody = require('koa-body')
const koaJson = require('koa-json')
const koaStatic = require('koa-static')
const session = require('koa-session')
const server = require('http').Server(app.callback())
const io = require('socket.io')(server)

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

app.use(logger())
app.use(koaBody())
app.use(session(CONFIG, app))
app.use(koaStatic('./public'))

router
  .get('/list', list)
  .get('/post/:id', show)
  .get('/message/:id', getmessage)
  .get('/user/:user', getuser)
  .get('/logined', logined)
  .get('/messages/:id', messages)
  .get('/searchresult', searchresult)
  .get('/remind/:user', getremind)
  .get('/friend', friend)
  .post('/login', login)
  .post('/signup', signup)
  .post('/post', create)
  .post('/logout', logout)
  .post('/edit/:id', edit)
  .post('/remove/:id', remove)
  .post('/search', search)
  .post('/insertmessage/:id', insertmessage)
  .post('/editmessage/:id', editmessage)
  .post('/removemessage/:id', removemessage)
  .post('/sendremind/:user', sendremind)
  .post('/remind/:id', addfriend)

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
  post.owner = ctx.session.user.name
  await db.insert('posts', post)
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
  let id = ctx.params.id
  await db.delete('posts', id)
  ctx.status = 200
}

async function insertmessage (ctx) {
  let id = ctx.params.id
  let message = JSON.parse(ctx.request.body)
  message.owner = id
  message.writer = ctx.session.user.name
  await db.insert('messages', message)
  ctx.status = 200
}

async function editmessage (ctx) {
  let message = JSON.parse(ctx.request.body)
  console.log(message)
  let target = await db.findOne('messages', ctx.params.id)
  console.log(target)
  target.body = message.body
  await db.update('messages', ctx.params.id, target)
  ctx.status = 200
}

async function removemessage (ctx) {
  let id = ctx.params.id
  await db.delete('messages', id)
  ctx.status = 200
}

async function messages (ctx) {
  let id = ctx.params.id
  let message = await db.findMessages('messages', id)
  if (message) {
    ctx.status = 200
    ctx.body = message
  }
}

async function getmessage (ctx) {
  const id = ctx.params.id
  const message = await db.findOne('messages', id)
  if (message) {
    ctx.body = message
    ctx.status = 200
  }
}

// user

async function signup (ctx) {
  let user = JSON.parse(ctx.request.body)
  let account = await db.findUser('users', user.account)
  if (account) ctx.status = 401
  else {
    user.friend = []
    await db.insert('users', user)
    ctx.status = 200
  }
}

async function login (ctx) {
  let user = JSON.parse(ctx.request.body)
  let login = await db.findUser('users', user.account)
  console.log(JSON.stringify(login))
  if (login) {
    if (login.account === user.account && login.password === user.password) {
      ctx.session.user = login
      console.log(ctx.session.user)
      ctx.status = 200
    } else {
      ctx.status = 401
    }
  } else {
    ctx.status = 401
  }
}

async function logout (ctx) {
  ctx.session.user = null
  ctx.status = 200
}

async function logined (ctx) {
  if (ctx.session.user) {
    let user = await db.findUser('users', ctx.session.user.account)
    if (user) {
      ctx.status = 200
      ctx.body = user
    } else {
      ctx.body = 401
    }
  } else ctx.status = 401
}

async function getuser (ctx) {
  let account = ctx.params.user
  let user = await db.findUser('users', account)
  ctx.body = user
  ctx.status = 200
}

async function getremind (ctx) {
  let user = ctx.params.user
  let remind = await db.findRemind('reminds', user)
  ctx.body = remind
  ctx.status = 200
}

async function sendremind (ctx) {
  let remind = JSON.parse(ctx.request.body)
  let x = await db.insert('reminds', remind)
  if (x) ctx.status = 200
}

async function addfriend (ctx) {
  let target = JSON.parse(ctx.request.body)
  let remind = await db.addfriend('reminds', target.id)
  console.log(remind)
  let pa = await db.findUser('users', remind.owner)
  let pb = await db.findUser('users', remind.sendaccount)
  pa.friend.push(pb.account)
  pb.friend.push(pa.account)
  console.log(pa)
  console.log(pb)
  await db.update('users', pa._id, pa)
  await db.update('users', pb._id, pb)
  await db.delete('reminds', target.id)
}

async function friend (ctx) {
  let list = []
  let friends = await db.findFriend('users', ctx.session.user._id)
  for (let friend of friends) {
    let target = await db.findUser('users', friend)
    list.push(target)
  }
  ctx.body = list
}

// message

// search

async function search (ctx) {
  let target = JSON.parse(ctx.request.body)
  let users = await db.search('users', {'name': target.index})
  let posts = await db.search('posts', {'title': target.index})
  searchpost = posts
  searchuser = users
  ctx.status = 200
}

async function searchresult (ctx) {
  ctx.body = [searchpost, searchuser]
}

// chat-pair

io.on('connection', (socket) => {
  console.log('a user connected')
  socket.on('chat message', (msg) => {
    if (msg !== '') {
      io.emit('chat message', msg)
    }
  })
})

if (!module.parent) {
  app.listen(3000)
  console.log('Server run at http://localhost:3000')
}
