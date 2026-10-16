const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

let token = null

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', name: 'Superuser', passwordHash })
  await user.save()

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
  token = loginResponse.body.token

  const blogObjects = helper.initialBlogs.map(
    (blog) => new Blog({ ...blog, user: user._id })
  )
  await Blog.insertMany(blogObjects)

  user.blogs = (await Blog.find({})).map((blog) => blog._id)
  await user.save()
})

describe('when there are initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('the unique identifier property is named id', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach((blog) => {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map((blog) => blog.title)
    assert(titles.includes('React patterns'))
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data and a valid token', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'Nobody',
      url: 'http://localhost/',
      likes: 3,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map((blog) => blog.title)
    assert(titles.includes('async/await simplifies making async calls'))
  })

  test('fails with status code 401 if a token is not provided', async () => {
    const newBlog = {
      title: 'no token here',
      author: 'Nobody',
      url: 'http://localhost/',
      likes: 1,
    }

    await api.post('/api/blogs').send(newBlog).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('likes default to zero when missing from the request', async () => {
    const newBlog = {
      title: 'likes will default',
      author: 'Nobody',
      url: 'http://localhost/',
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('fails with status code 400 if title is missing', async () => {
    const newBlog = { author: 'Nobody', url: 'http://localhost/', likes: 1 }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('fails with status code 400 if url is missing', async () => {
    const newBlog = { title: 'no url', author: 'Nobody', likes: 1 }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 for the creator', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map((blog) => blog.title)
    assert(!titles.includes(blogToDelete.title))
  })

  test('fails with status code 401 if a token is not provided', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('fails if the blog was created by another user', async () => {
    const passwordHash = await bcrypt.hash('sekret2', 10)
    const otherUser = new User({
      username: 'other',
      name: 'Other User',
      passwordHash,
    })
    await otherUser.save()

    const otherLogin = await api
      .post('/api/login')
      .send({ username: 'other', password: 'sekret2' })
    const otherToken = otherLogin.body.token

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('updating a blog', () => {
  test('succeeds in updating the number of likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updated = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ ...blogToUpdate, likes: 99 })
      .expect(200)

    assert.strictEqual(updated.body.likes, 99)
  })
})

after(async () => {
  await mongoose.connection.close()
})
