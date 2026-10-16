const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const User = require('../models/user')

const api = supertest(app)

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map((user) => user.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('expected `username` to be unique'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails if username is too short', async () => {
    const newUser = { username: 'ab', name: 'Short', password: 'salainen' }

    const result = await api.post('/api/users').send(newUser).expect(400)

    assert(result.body.error.includes('at least 3 characters long'))
  })

  test('creation fails if password is missing', async () => {
    const newUser = { username: 'validname', name: 'No Password' }

    const result = await api.post('/api/users').send(newUser).expect(400)

    assert(result.body.error.includes('at least 3 characters long'))
  })

  test('creation fails if password is too short', async () => {
    const newUser = { username: 'validname', name: 'Short', password: 'pw' }

    const result = await api.post('/api/users').send(newUser).expect(400)

    assert(result.body.error.includes('at least 3 characters long'))
  })
})

describe('login', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  test('succeeds with correct credentials and returns a token', async () => {
    const result = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)

    assert.ok(result.body.token)
    assert.strictEqual(result.body.username, 'root')
  })

  test('fails with wrong password', async () => {
    await api
      .post('/api/login')
      .send({ username: 'root', password: 'wrong' })
      .expect(401)
  })

  test('fails with unknown username', async () => {
    await api
      .post('/api/login')
      .send({ username: 'nobody', password: 'sekret' })
      .expect(401)
  })
})

after(async () => {
  await mongoose.connection.close()
})
