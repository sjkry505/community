const logger = require('koa-logger')
const router = require('koa-router')()
const koaBody = require('koa-body')
const koaJson = require('koa-json')
const koaStatic = require('koa-static')

const Koa = require('koa')
const app = (module.exports = new Koa())

const posts = []
const users = []
let searchpost = []
let searchuser = []
let account = false
let index = 0

app.use(logger())

app.use(koaBody())
app.use(koaStatic('./public'))

router
  .get('/list', list)
  .get('/post/:id', show)
  .get('/user/:user', getuser)
  .get('/searchresult', searchresult)
  .post('/login', login)
  .post('/signup', signup)
  .post('/post', create)
  .post('/logout', logout)
  .post('/edit', edit)
  .post('/remove', remove)
  .post('/search', search)
  .post('/addfriend', addfriend)

app.use(router.routes())
app.use(koaJson())

// post

async function list (ctx) {
  searchpost = []
  searchuser = []
  ctx.body = posts
}

async function show (ctx) {
  const id = ctx.params.id
  const post = posts[id]
  if (!post) ctx.throw(404, 'invalid post id')
  ctx.body = post
  ctx.status = 200
}

async function create (ctx) {
  console.log(JSON.parse(ctx.request.body))
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
  user.friend = []
  user.notify = []
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

async function getuser (ctx) {
  let account = ctx.params.user
  for (let i of users) {
    if (account === i.account) {
      ctx.body = i
    }
  }
  ctx.status = 200
}

async function addfriend (ctx) {
  let user = JSON.parse(ctx.request.body)
  for (let i of users) {
    if (user.account === i.account) {
      i.friend.push(user.name)
      befriend(user.name, i.name)
    }
  }
  ctx.status = 200
}

async function befriend (user, friend) {
  for (let i of users) {
    if (user === i.name) {
      i.notify.push({'type': 'inviter', 'who': friend})
      console.log(i)
    }
  }
}

// message

// search

async function search (ctx) {
  searchpost = []
  searchuser = []
  let target = JSON.parse(ctx.request.body)
  for (let i of users) {
    if (i.name === target.index) {
      searchuser.push(i)
    }
  }
  for (let i of posts) {
    if (i.title === target.index) {
      searchpost.push(i)
    }
  }
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
