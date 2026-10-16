import { useEffect, useRef } from 'react'
import {
  Routes,
  Route,
  Link,
  Navigate,
  useMatch,
  useNavigate,
} from 'react-router-dom'
import { Container, AppBar, Toolbar, Button } from '@mui/material'

import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'
import Notification from './components/Notification'
import ErrorBoundary from './components/ErrorBoundary'
import NotFound from './components/NotFound'
import Users from './components/Users'
import UserView from './components/UserView'
import blogService from './services/blogs'
import loginService from './services/login'
import { getUser, saveUser, removeUser } from './services/persistentUser'
import { useBlogs, useBlogActions } from './stores/useBlogStore'
import { useUser, useUserActions } from './stores/useUserStore'
import {
  useNotification,
  useNotificationActions,
} from './stores/useNotificationStore'

const Menu = ({ user, onLogout }) => {
  const style = { '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }

  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" component={Link} to="/" sx={style}>
          blogs
        </Button>
        <Button color="inherit" component={Link} to="/users" sx={style}>
          users
        </Button>
        {user && (
          <Button color="inherit" component={Link} to="/create" sx={style}>
            new blog
          </Button>
        )}
        {user ? (
          <span>
            <em>{user.name} logged in</em>
            <Button color="inherit" onClick={onLogout}>
              logout
            </Button>
          </span>
        ) : (
          <Button color="inherit" component={Link} to="/login" sx={style}>
            login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}

const BlogList = () => {
  const blogs = useBlogs()
  const { likeBlog, removeBlog, addComment } = useBlogActions()
  const user = useUser()

  return (
    <div>
      <h2>blogs</h2>
      {[...blogs]
        .sort((a, b) => b.likes - a.likes)
        .map((blog) => (
          <Blog
            key={blog.id}
            blog={blog}
            user={user}
            onLike={likeBlog}
            onRemove={removeBlog}
            onAddComment={addComment}
          />
        ))}
    </div>
  )
}

const BlogView = () => {
  const blogs = useBlogs()
  const { likeBlog, removeBlog, addComment } = useBlogActions()
  const user = useUser()
  const match = useMatch('/blogs/:id')
  const blog = match ? blogs.find((b) => b.id === match.params.id) : null

  if (!blog) {
    return <NotFound />
  }

  return (
    <div>
      <h2>
        {blog.title} {blog.author}
      </h2>
      <Blog
        blog={blog}
        user={user}
        onLike={likeBlog}
        onRemove={removeBlog}
        onAddComment={addComment}
        defaultExpanded
      />
    </div>
  )
}

const App = () => {
  const { fetchBlogs, blogCreated } = useBlogActions()
  const user = useUser()
  const { setUser, clearUser } = useUserActions()
  const notification = useNotification()
  const { notify } = useNotificationActions()

  const blogFormRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  useEffect(() => {
    const loggedUser = getUser()
    if (loggedUser) {
      setUser(loggedUser)
      blogService.setToken(loggedUser.token)
    }
  }, [setUser])

  const handleLogin = async (username, password) => {
    try {
      const loggedUser = await loginService.login({ username, password })
      saveUser(loggedUser)
      blogService.setToken(loggedUser.token)
      setUser(loggedUser)
      navigate('/')
    } catch {
      notify('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    removeUser()
    blogService.setToken(null)
    clearUser()
    navigate('/')
  }

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    blogService
      .create(blogObject)
      .then((returnedBlog) => {
        blogCreated({ ...returnedBlog, user })
        notify(
          `a new blog ${returnedBlog.title} by ${returnedBlog.author} added`
        )
        navigate('/')
      })
      .catch((error) => {
        notify(error.response?.data?.error || 'blog creation failed', 'error')
      })
  }

  return (
    <Container>
      <Menu user={user} onLogout={handleLogout} />
      <Notification notification={notification} />

      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate replace to="/" />
              ) : (
                <LoginForm handleSubmit={handleLogin} />
              )
            }
          />
          <Route path="/blogs/:id" element={<BlogView />} />
          <Route
            path="/create"
            element={
              user ? (
                <Togglable buttonLabel="create new blog" ref={blogFormRef}>
                  <BlogForm createBlog={addBlog} />
                </Togglable>
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </Container>
  )
}

export default App
