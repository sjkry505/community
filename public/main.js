const blog = {
  controller: window,
  view: {},
  model: {}
}

let login = false
let trigger = false

window.onhashchange = async function () {
  let posts = await blog.model.list()
  blog.view.list(posts, login)
  trigger = false
  console.log(login)
}

window.onload = function () {
  window.onhashchange()
}

// view post

blog.view.list = async function (posts, login) {
  if (login !== false) {
    let user = await blog.model.getUser(login)
    document.querySelector('#userlist').innerHTML = `
      <div class="well" style="margin-top: 10px;wdith:100px">
        <h2 style="margin-left:15px">${user.name}</h2>
          <div class="dropdown">
            <a id="ownpost" class="btn dropdown-toggle" type="button" data-toggle="dropdown" style="background:rgba(0,0,0,0)">Your post<span class="caret"></span></a>
            <ul class="dropdown-menu" style="height: 90px; overflow: auto">
            ${(() => {
              let html = ''
              for (let post of posts) {
                if (post.owner === login) {
                  html += `<li style="height:30px; margin:0"><a onclick="blog.view.show(${post.id})">${post.title}</a><li>`
                }
              }
              return html
            })()}
            </ul>
          </div
        </div>
    `
  }
  if (login === false) {
    document.querySelector('#userlist').innerHTML = ''
  }
  let list = []
  for (let post of posts) {
    list.push(`
    <div id="list${post.id}">
      <div class="well" style="width:70%;margin:0 auto 10px auto" id="show${post.id}">
        <a id="re${post.id}" type="button" class="close" data-toggle="modal" data-target="#remove${post.id}Modal" onclick="blog.view.remove(${post.id})">
          <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
        </a>
        <a id="click${post.id}" type="button" class="close"  data-toggle="modal" data-target="#edit${post.id}Modal" onclick="blog.view.edit(${post.id})">
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
  document.querySelector('#content').innerHTML = `
    <div class="well" style="width:70%;margin:10px auto 10px auto">
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

blog.view.show = async function (id) {
  console.log(123)
  let post = await blog.model.getPost(id)
  document.querySelector('#content').innerHTML = `
    <div id="list${post.id}" style="margin-top:10px">
      <div class="well" style="width:70%;margin:0 auto 10px auto" id="show${post.id}">
        <a id="re${post.id}" type="button" class="close" data-toggle="modal" data-target="#remove${post.id}Modal" onclick="blog.view.remove(${post.id})">
          <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
        </a>
         <a id="click${post.id}" type="button" class="close"  data-toggle="modal" data-target="#edit${post.id}Modal" onclick="blog.view.edit(${post.id})">
          <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
        </a>
        <h1 style="margin: 0 0 0 15px;">${post.title}
          <small><small>建立者:${post.owner}</small></small>
        </h1>
        <p style="margin: 10px 0 0 15px;" class="text-justify">${post.body}</p>
      </div>
    </div>
  `
}

blog.view.edit = async function (id) {
  let editor = await blog.model.getPost(id)
  let edit = document.querySelector(`#list${id}`)
  if (trigger === false) {
    edit.insertAdjacentHTML('beforeend', `
      ${(() => {
        let html = ''
        if (login === editor.owner) {
          html += `
          <div class="modal fade" id="edit${id}Modal" role="dialog">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 class="modal-title">修改貼文</h4>
              </div>
              <div class="modal-body">
                <h1>${editor.title}</h1>
                <form>
                  <div class="form-group">
                    <textarea class="form-control" rows="5" id="edit${editor.id}" name="body" placeholder="Content">${editor.body}</textarea>
                  </div>
                  <div class="form-group">
                    <input class="btn btn-default" data-dismiss="modal" type="button" onclick="blog.model.edit(${editor.id})" value="Confirm">
                  </div> 
                </form>
              </div>
            </div>
          </div>
        </div>
          `
        } else if (login === false) {
          document.querySelector('#alert').innerHTML = `
            <div class="alert alert-danger alert-dismissible fade in">
              <a class="close" data-dismiss="alert" aria-label="close" onclick="blog.view.triggered()">&times;</a>
              <strong>請先登入</strong>
            </div>
          `
        } else {
          document.querySelector('#alert').innerHTML = `
          <div class="alert alert-danger alert-dismissible fade in">
            <a class="close" data-dismiss="alert" aria-label="close" onclick="blog.view.triggered()">&times;</a>
            <strong>你沒有權限修改文章</strong>
          </div>
          `
        }
        return html
      }
      )()}
    `)
    trigger = true
    document.querySelector(`#click${id}`).click()
  }
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
      let html = '<h3>post</h3>'
      for (let i of searchresult[0]) {
        html += `
          <div class="well" style="width:80%;margin:0 auto 10px auto">
            <a onclick="blog.view.show(${i.id})" style="text-decoration:none;color: #111111">
              <h1 style="margin: 0 0 0 15px;">${i.title}
                <small><small>建立者:${i.owner}</small></small>
              </h1>
              <p style="margin: 10px 0 0 15px;" class="text-justify">${i.body}</p>
            </a>
          </div>
          `
      }
      html += `<h3>User</h3>`
      for (let i of searchresult[1]) {
        html += `
          <div class="well" style="width:30%;margin-buttom:10px" id="search${i.account}">
            <a type="button" class="close" onclick="blog.model.friend(${i.account})">
              <span class="glyphicon glyphicon-plus" aria-hidden="true"></span>
            </a>
            <h3 style="margin: 0 0 0 15px;">${i.name}</h3>
          </div>`
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

blog.model.list = async function () {
  let r = await window.fetch('/list/')
  let posts = await r.json()
  return posts
}

blog.model.edit = async function (id, dir) {
  let body = document.querySelector(`#edit${id}`).value
  console.log(body)
  let r = await window.fetch('/edit', {
    body: JSON.stringify({body: body, id: id}),
    method: 'POST'
  })
  trigger = false
  if (dir === true) {
    blog.view.show(id)
  } else {
    window.onhashchange()
  }
  return r
}

blog.model.remove = async function (id) {
  let r = await window.fetch('/remove', {
    body: JSON.stringify({id: id}),
    method: 'POST'
  })
  window.onhashchange()
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
  let user = await blog.model.getUser(account)
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
    login = account
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

blog.model.getUser = async function (user) {
  let r = await window.fetch('/user/' + user)
  let name = await r.json()
  return name
}

blog.model.friend = async function (user) {
  let friend = await blog.model.getUser(user)
  let r = await window.fetch('/addfriend', {
    body: JSON.stringify({name: friend.name, account: login}),
    method: 'POST'
  })
  document.querySelector(`#search${user}`).innerHTML = `
    <h3 style="margin: 0 0 0 15px;">
      <label style="width:70%">${friend.name}</label>
      <button style="margin:0;width: 30%" value="已送出邀請"><button>
    </h3>
  `
  return r
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
