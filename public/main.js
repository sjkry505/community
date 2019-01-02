const blog = {
  controller: window,
  view: {},
  model: {}
}

let login = false
let trigger = false

window.onhashchange = async function () {
  let r, post, message
  var tokens = window.location.hash.split('/')
  blog.view.userlist()
  switch (tokens[0]) {
    case '#show':
      r = await window.fetch('/post/' + tokens[1])
      post = await r.json()
      blog.view.show(post)
      break
    case '#edit':
      post = await blog.model.getPost(tokens[1])
      if (login === post.owner) {
        blog.view.edit(post)
      } else if (login === false) {
        document.querySelector('#alert').innerHTML = `
          <div class="alert alert-danger alert-dismissible fade in">
            <a class="close" data-dismiss="alert" aria-label="close" onclick="blog.view.triggered()">&times;</a>
            <strong>請先登入</strong>
          </div>
        `
        window.location.hash = ''
      } else {
        document.querySelector('#alert').innerHTML = `
          <div class="alert alert-danger alert-dismissible fade in">
            <a class="close" data-dismiss="alert" aria-label="close" onclick="blog.view.triggered()">&times;</a>
            <strong>你沒有權限修改貼文</strong>
          </div>
        `
        window.location.hash = ''
      }
      break
    case '#remove':
      post = await blog.model.getPost(tokens[1])
      if (login === false) {
        document.querySelector('#alert').innerHTML = `
        <div class="alert alert-danger alert-dismissible fade in">
          <a class="close" data-dismiss="alert" aria-label="close" onclick="blog.view.triggered()">&times;</a>
          <strong>請先登入</strong>
        </div>
        `
      } else if (login === post.owner) {
        blog.model.remove(tokens[1])
        return r
      } else {
        document.querySelector('#alert').innerHTML = `
          <div class="alert alert-danger alert-dismissible fade in">
            <a class="close" data-dismiss="alert" aria-label="close" onclick="blog.view.triggered()">&times;</a>
            <strong>你沒有權限刪除貼文</strong>
          </div>`
      }
      window.location.hash = ''
      break
    case '#editmessage':
      message = await blog.model.getMessage(tokens[1])
      if (login === message.writer) {
        blog.view.editmessage(message)
      } else if (login === false) {
        document.querySelector('#alert').innerHTML = `
          <div class="alert alert-danger alert-dismissible fade in">
            <a class="close" data-dismiss="alert" aria-label="close" onclick="blog.view.triggered()">&times;</a>
            <strong>請先登入</strong>
          </div>
        `
        window.location.hash = ''
      } else {
        document.querySelector('#alert').innerHTML = `
          <div class="alert alert-danger alert-dismissible fade in">
            <a class="close" data-dismiss="alert" aria-label="close" onclick="blog.view.triggered()">&times;</a>
            <strong>你沒有權限修改貼文</strong>
          </div>
        `
        window.location.hash = ''
      }
      break
    case '#removemessage':
      message = await blog.model.getMessage(tokens[1])
      if (login === false) {
        document.querySelector('#alert').innerHTML = `
        <div class="alert alert-danger alert-dismissible fade in">
          <a class="close" data-dismiss="alert" aria-label="close" onclick="blog.view.triggered()">&times;</a>
          <strong>請先登入</strong>
        </div>
        `
      } else if (login === message.writer) {
        blog.model.removemessage(tokens[1])
      } else {
        document.querySelector('#alert').innerHTML = `
          <div class="alert alert-danger alert-dismissible fade in">
            <a class="close" data-dismiss="alert" aria-label="close" onclick="blog.view.triggered()">&times;</a>
            <strong>你沒有權限刪除貼文</strong>
          </div>`
      }
      window.location.hash = ''
      break
    case '#message':
      blog.model.message(tokens[1])
      break
    default:
      r = await window.fetch('/list/')
      let posts = await r.json()
      blog.view.list(posts, login)
      break
  }
  trigger = false
  if (login) {
    document.querySelector('#logined').innerHTML = `
      <li><a class="btn btn-info btn-md" style="background-color:#272727;border: none"><span class="glyphicon glyphicon-user"></span>${login}</a></li>
      <li><a class="btn btn-info btn-md" onclick="blog.model.logout()" style="background-color:#272727;border: none"><span class="glyphicon glyphicon-log-in"></span> Log out</a></li>
    `
  }
}

window.onload = function () {
  blog.view.logined()
  window.onhashchange()
}

// view post

blog.view.list = async function (posts, login) {
  let list = []
  for (let post of posts) {
    list.push(`
      <div id="list${post._id}" onclick="window.location.hash = '#show/${post._id}'">
        <div class="well" style="width:100%;margin:0 auto 10px auto" id="show${post._id}">
          <a id="re${post._id}" type="button" class="close" href="#remove/${post._id}">
            <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
          </a>
          <a id="click${post._id}" type="button" class="close" href="/#edit/${post._id}">
            <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
          </a>
          <h1 style="margin: 0 0 0 15px;">${post.title}
            <small><small>建立者:${post.owner}</small></small>
          </h1>
          <p style="margin: 10px 0 0 15px;" class="text-justify">${post.body}</p>
        </div>
      </div>
    `)
  }
  list.reverse()
  document.querySelector('#content').innerHTML = `
    <div class="well" style="width:100%;margin:10px auto 10px auto">
    <a data-toggle="modal" data-target="#postModal" style="margin: 10px 0 0 0;border: none;text-decoration: none; color: #111111">
      <h3 style="margin:0"><small><i class="glyphicon glyphicon-pencil"></i></small>新增貼文</h3>
      <div class="form-group" style="margin:0;">
        <textarea class="form-control" rows="5" id="body" name="body" placeholder="Content"></textarea>
      </div>
      </a>
    </div>
  
  ${
    (() => {
      let html = ''
      if (login) {
        html += `
          <div class="modal fade" id="postModal" role="dialog">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal">&times;</button>
                  <h4 class="modal-title">New post</h4>
                </div>
                <div class="modal-body">
                  <form>
                    <div class="input-group">
                      <span class="input-group-addon">Title</span>
                      <input id="title" type="text" class="form-control" name="title" placeholder="Title" autocomplete="off">
                    </div>
                    <div class="form-group">
                      <textarea class="form-control" rows="5" id="textbody" name="body" placeholder="Content"></textarea>
                    </div>
                    <div class="form-group">
                      <input class="btn btn-default" data-dismiss="modal" type="button" onclick="blog.model.savePost()" value="Create">
                    </div> 
                  </form>
                </div>
              </div>
            </div>
          </div>
        `
      } else {
        html += `
        <div class="modal fade" id="postModal" role="dialog">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">請先登入</h4>
              </div>
            </div>
          </div>
        </div>`
      }
      return html
    }
    )()
  }
  ${list.join('\n')}
  `
}

blog.view.userlist = async function () {
  let r = await window.fetch('/list/')
  let posts = await r.json()
  posts.reverse()
  if (login !== false || login !== undefined) {
    document.querySelector('#userlist').innerHTML = `
      <div class="well" style="margin-top: 10px;">
        <h2 style="margin-left:15px">${login}</h2>
          <div class="dropdown">
            <a id="ownpost" class="btn dropdown-toggle" type="button" data-toggle="dropdown" style="background:rgba(0,0,0,0)">Your post<span class="caret"></span></a>
            <ul class="dropdown-menu" style="height: 90px; overflow: auto">
            ${(() => {
              let html = ''
              for (let post of posts) {
                if (post.owner === login) {
                  html += `<li style="height:30px; margin:0"><a href="#show/${post._id}">${post.title}</a><li>`
                }
              }
              return html
            })()}
            </ul>
          </div
        </div>
    `
  }
  if (login === false || login === undefined) {
    document.querySelector('#userlist').innerHTML = ''
  }
}

blog.view.show = async function (post) {
  let list = []
  let messages = await blog.view.messages(post)
  for (let message of messages) {
    list.push(`
      <div class="input-group" id="message${message._id}">
        <span class="input-group-addon">${message.writer}</span>
        <p class="form-control" >${message.body}
          <a type="button" class="close" href="#removemessage/${message._id}">
            <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
          </a>
          <a type="button" class="close" href="/#editmessage/${message._id}">
            <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
          </a>
        </p>
      </div>
    `)
  }
  document.querySelector('#content').innerHTML = `
    <div id="list${post.id}" style="margin-top:10px">
      <div class="well" style="width:100%;margin:0 auto 10px auto" id="show${post.id}">
        <a type="button" class="close" href="#remove/${post._id}">
          <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
        </a>
        <a type="button" class="close" href="/#edit/${post._id}">
          <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
        </a>
        <h1 style="margin: 0 0 0 15px;">${post.title}
          <small><small>建立者:${post.owner}</small></small>
        </h1>
        <p style="margin: 10px 0 0 15px;" class="text-justify">${post.body}</p>
        <hr>
        ${
          (() => {
            let html = ''
            html += `
              <ul class="list-group">
                ${list.join('\n')}
              </ul>
            `
            return html
          }
          )()
        }
        <form>
          <div class="form-group">
            <textarea class="form-control" rows="2" id="textbody" name="body" placeholder="Content"></textarea>
          </div>
          <div class="form-group">
          <input class="btn btn-default" type="button" onclick="window.location.hash = '#message/${post._id}'" value="留言">
          </div> 
        </form>
      </div>
    </div>
  `
}

blog.view.messages = async function (post) {
  let r = await window.fetch(`/messages/${post._id}`)
  let result = await r.json()
  return result
}

blog.view.edit = async function (post) {
  document.querySelector('#content').innerHTML = `
    <div class="well" style="width:70%;margin:10px auto 10px auto">
      <a data-toggle="modal" data-target="#editModal" style="margin: 10px 0 0 0;border: none;text-decoration: none; color: #111111">
        <h3 style="margin:0">${post.title}</h3>
        <div class="form-group" style="margin:0;">
          <textarea class="form-control" rows="5" id="body" name="body" placeholder="Content">${post.body}</textarea>
        </div>
      </a>
    </div>
    <div class="modal fade" id="editModal" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">&times;</button>
              <h4 class="modal-title">${post.title}</h4>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group">
                <textarea class="form-control" rows="5" id="textbody" name="body" placeholder="Content">${post.body}</textarea>
              </div>
              <div class="form-group">
                <input class="btn btn-default" data-dismiss="modal" type="button" onclick="blog.model.edit()" value="修改">
              </div> 
            </form>
          </div>
        </div>
      </div>
    </div>
  `
}

blog.view.editmessage = async function (message) {
  document.querySelector(`#message${message._id}`).innerHTML = `
    <span class="input-group-addon">${message.writer}</span>
    <a data-toggle="modal" data-target="#editModal" style="margin: 10px 0 0 0;border: none;text-decoration: none; color: #111111"> 
      <input id="name" type="text" class="form-control" name="name" value="${message.body}" autocomplete="off">
    </a>
    <div class="modal fade" id="editModal" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-body">
            <form>
              <div class="form-group">
                <textarea class="form-control" rows="5" id="textbody" name="body" placeholder="Content">${message.body}</textarea>
              </div>
              <div class="form-group">
                <input class="btn btn-default" data-dismiss="modal" type="button" onclick="blog.model.editmessage()" value="修改">
              </div> 
            </form>
          </div>
        </div>
      </div>
    </div>
  `
}

blog.view.remove = async function (id) {
  let post = await blog.model.getPost(id)
  if (login === false) {
    document.querySelector('#alert').innerHTML = `
    <div class="alert alert-danger alert-dismissible fade in">
      <a class="close" data-dismiss="alert" aria-label="close" onclick="blog.view.triggered()">&times;</a>
      <strong>請先登入</strong>
    </div>
    `
  } else if (login === post.owner) {
    blog.model.remove(id)
  } else {
    document.querySelector('#alert').innerHTML = `
      <div class="alert alert-danger alert-dismissible fade in">
        <a class="close" data-dismiss="alert" aria-label="close" onclick="blog.view.triggered()">&times;</a>
        <strong>你沒有權限刪除貼文</strong>
      </div>`
  }
}

blog.view.triggered = () => {
  trigger = false
}
// view-message

// view-search

blog.view.search = async function () {
  let r = await window.fetch('/searchresult')
  let searchresult = await r.json()
  document.querySelector('#content').innerHTML = `
    <h1>搜尋結果：</h1>
    ${(() => {
      let html = '<h3>Post</h3>'
      for (let i of searchresult[0]) {
        html += `
          <a onclick="blog.view.show(${i._id})" style="text-decoration:none;color: #111111">
            <div class="well" style="width:80%;margin:0 auto 10px auto">
            
              <h1 style="margin: 0 0 0 15px;">${i.title}
                <small><small>建立者:${i.owner}</small></small>
              </h1>
              <p style="margin: 10px 0 0 15px;" class="text-justify">${i.body}</p>
            </div>
          </a>
          `
      }
      html += `<h3>User</h3>`
      for (let i of searchresult[1]) {
        html += `
          <div class="well" style="width:30%;margin-buttom:10px" id="search${i.name}">
            <h3 style="margin: 0 0 0 15px;">${i.name}</h3>
          </div>
        `
      }
      return html
    }
      )()}
  `
}

// view-chat

// view-pair

// model-post

blog.model.savePost = async function () {
  let title = document.querySelector('#title').value
  let body = document.querySelector('#textbody').value
  let r = await window.fetch('/post', {
    body: JSON.stringify({title: title, body: body}),
    method: 'POST'
  })
  window.onhashchange()
  return r
}

blog.model.getPost = async function (id) {
  let r = await window.fetch('/post/' + id)
  let post = await r.json()
  return post
}

blog.model.getMessage = async function (id) {
  let r = await window.fetch('/message/' + id)
  let message = await r.json()
  return message
}

blog.model.edit = async function () {
  let body = document.querySelector(`#textbody`).value
  let tokens = window.location.hash.split('/')
  let r = await window.fetch('/edit/' + tokens[1], {
    body: JSON.stringify({body: body, id: tokens[1]}),
    method: 'POST'
  })
  window.location.hash = `show/${tokens[1]}`
  return r
}

blog.model.editmessage = async function () {
  let body = document.querySelector(`#textbody`).value
  let tokens = window.location.hash.split('/')
  let message = await blog.model.getMessage(tokens[1])
  let r = await window.fetch('/editmessage/' + tokens[1], {
    body: JSON.stringify({body: body, id: tokens[1]}),
    method: 'POST'
  })
  window.location.hash = `show/${message.owner}`
  return r
}

blog.model.remove = async function (id) {
  let r = await window.fetch('/remove/' + id, {
    body: JSON.stringify({id: id}),
    method: 'POST'
  })
  window.location.hash = ''
  return r
}

blog.model.removemessage = async function (id) {
  let message = await blog.model.getMessage(id)
  let r = await window.fetch('/removemessage/' + id, {
    body: JSON.stringify({id: id}),
    method: 'POST'
  })
  window.location.hash = `show/${message.owner}`
  return r
}

blog.model.message = async function (id) {
  let message = document.querySelector('#textbody').value
  let r = await window.fetch(`/insertmessage/${id}`, {
    body: JSON.stringify({body: message}),
    method: 'POST'
  })
  window.location.hash = `show/${id}`
  return r
}

// model-user

blog.model.signup = async function () {
  let name = document.querySelector('#name').value
  let account = document.querySelector('#account').value
  let password = document.querySelector('#password').value
  let birthday = document.querySelector('#birthday').value
  let r = await window.fetch('/signup', {
    body: JSON.stringify({name: name, account: account, password: password, birthday: birthday}),
    method: 'POST'
  })
  if (r.status === 401) {
    document.querySelector('#alert').innerHTML = `  <div class="alert alert-danger alert-dismissible fade in">
    <a class="close" data-dismiss="alert" aria-label="close">&times;</a>
    <strong>帳號已存在</strong>
  </div>`
  }
  document.querySelector('#name').value = ''
  document.querySelector('#account').value = ''
  document.querySelector('#password').value = ''
  document.querySelector('#birthday').value = ''
  window.onhashchange()
  return r
}

blog.model.login = async function () {
  let account = document.querySelector('#user').value
  let password = document.querySelector('#user-password').value
  let r = await window.fetch('/login', {
    body: JSON.stringify({account: account, password: password}),
    method: 'POST'
  })
  if (r.status === 401) {
    document.querySelector('#alert').innerHTML = `  <div class="alert alert-danger alert-dismissible fade in">
    <a class="close" data-dismiss="alert" aria-label="close">&times;</a>
    <strong>帳號或密碼錯誤</strong>
  </div>`
  }
  if (r.status === 200) {
    let user = await blog.model.getUser(account)
    login = user.name
    document.querySelector('#logined').innerHTML = `
      <li><a class="btn btn-info btn-md" style="background-color:#272727;border: none"><span class="glyphicon glyphicon-user"></span>${user.name}</a></li>
      <li><a class="btn btn-info btn-md" onclick="blog.model.logout()" style="background-color:#272727;border: none"><span class="glyphicon glyphicon-log-in"></span> Log out</a></li>
    `
  }
  document.querySelector('#user').value = ''
  document.querySelector('#user-password').value = ''
  window.onhashchange()
  return r
}

blog.model.logout = async function () {
  let account = login
  let r = await window.fetch('/logout', {
    body: JSON.stringify({account: account}),
    method: 'POST'
  })
  if (r.status === 200) {
    login = false
    document.querySelector('#logined').innerHTML = `
    <li><a class="btn btn-info btn-md" data-toggle="modal" data-target="#signupModal" style="background-color:#272727;border: none"><span class="glyphicon glyphicon-user"></span> Sign Up</a></li>
    <li><a class="btn btn-info btn-md" data-toggle="modal" data-target="#loginModal" style="background-color:#272727;border: none"><span class="glyphicon glyphicon-log-in"></span> Login</a></li>
    `
  }
  window.onhashchange()
  return r
}

blog.view.logined = async function () {
  let r = await window.fetch('/logined')
  let user = await r.json()
  if (user) {
    login = user.user
    return true
  } else return false
}

blog.model.getUser = async function (user) {
  let r = await window.fetch('/user/' + user)
  let name = await r.json()
  return name
}

// model-search

blog.model.search = async function () {
  let index = document.querySelector('#search').value
  let r = await window.fetch('/search', {
    body: JSON.stringify({index: index}),
    method: 'POST'
  })
  blog.view.search()
  document.querySelector('#search').value = ''
  return r
}
