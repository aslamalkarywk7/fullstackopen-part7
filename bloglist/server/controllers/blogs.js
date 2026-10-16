const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body
  const user = request.user

  if (!user) {
    return response.status(400).json({ error: 'userId missing or not valid' })
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes === undefined ? 0 : likes,
    user: user._id,
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).end()
  }

  if (!user || blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'only the creator can delete a blog' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { title, author, url, likes },
    { new: true, runValidators: true, context: 'query' }
  )

  if (!updatedBlog) {
    return response.status(404).end()
  }

  response.json(updatedBlog)
})

blogsRouter.post('/:id/comments', async (request, response) => {
  const { comment } = request.body

  if (!comment) {
    return response.status(400).json({ error: 'comment missing' })
  }

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).end()
  }

  blog.comments = blog.comments.concat(comment)
  const updatedBlog = await blog.save()

  response.status(201).json(updatedBlog)
})

module.exports = blogsRouter
