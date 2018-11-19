const blog = {
  controller: window,
  view: {},
  model: {}
}

let login = false

window.onhashchange = async function (tokens) {
  console.log('tokens=', tokens)
  let posts = await blog.model.list()
  blog.view.list(posts, login)
}

window.onload = function () {
  window.onhashchange()
}

// view

blog.view.layout = function (title, content) {
  document.querySelector('title').innerText = title
  document.querySelector('#content').innerHTML = content
}

// view post

blog.view.list = function (posts, login) {
  let list = []
  for (let post of posts) {
    console.log(post)
    list.push(`
      <div class="well" style="width:70%;margin:0 auto 10px auto">
        <h1 style="margin: 0 0 0 15px;">${post.title}
          <small><small>建立者:${post.owner}</small></small>
        </h1>
        <p style="margin: 10px 0 0 15px;" class="text-justify">${post.body}</p>
      </div>
    `)
  }
  let content = `
  <p><a class="btn btn-primary btn-md" data-toggle="modal" data-target="#postModal" style="margin: 10px 0 0 0;border: none">New</a></p>
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
                      <input id="title" type="text" class="form-control" name="title" placeholder="Title">
                    </div>
                    <div class="form-group">
                      <textarea class="form-control" rows="5" id="body" name="body" placeholder="Content"></textarea>
                    </div>
                    <div class="form-group">
                      <input id="savePost" class="btn btn-default" data-dismiss="modal" type="button" onclick="blog.model.savePost()" value="Create">
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
  return blog.view.layout('Posts', content)
}

blog.view.show = async function (id) {
  let post = await blog.model.getPost(id)
  console.log(id)
  return blog.view.layout(post.title, `
  <div class="well" style="margin:20px 0 0 0;">
    <h1 style="margin: 0 0 0 15px;">${post.title}
      <small><small>建立者:${post.owner}</small></small>
    </h1>
    <p style="margin: 10px 0 0 15px;" class="text-justify">${post.body}</p>
  </div>
  `)
}

// view-message

// view-search

// view-chat

// view-pair

// model

blog.model.savePost = async function () {
  let title = document.querySelector('#title').value
  let body = document.querySelector('#body').value
  let r = await window.fetch('/post', {
    body: JSON.stringify({title: title, body: body}),
    method: 'POST'
  })
  window.onhashchange('')
  return r
}

blog.model.getPost = async function (id) {
  let r = await window.fetch('/post/' + id)
  let post = await r.json()
  return post
}

blog.model.list = async function () {
  let r = await window.fetch('/list/')
  let posts = await r.json()
  return posts
}

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
    document.querySelector('#alert').innerHTML += `  <div class="alert alert-danger alert-dismissible fade in style="float: left;">
    <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
    <strong>帳號已存在</strong>
  </div>`
  }
  window.onhashchange('')
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
    document.querySelector('#alert').innerHTML += `  <div class="alert alert-danger alert-dismissible fade in style="float: left;">
    <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
    <strong>帳號密碼錯誤</strong>
  </div>`
  }
  if (r.status === 200) {
    login = account
    document.querySelector('#logined').innerHTML = `
      <li><a class="btn btn-info btn-md" style="background-color:#272727;border: none"><span class="glyphicon glyphicon-user"></span>${account}</a></li>
      <li><a class="btn btn-info btn-md" onclick="blog.model.logout()" style="background-color:#272727;border: none"><span class="glyphicon glyphicon-log-in"></span> Log out</a></li>
    `
  }
  window.onhashchange('')
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
  window.onhashchange('')
  return r
}
