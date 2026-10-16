import { create } from 'zustand'
import blogService from '../services/blogs'

const useBlogStore = create((set) => ({
  blogs: [],
  actions: {
    fetchBlogs: async () => {
      const blogs = await blogService.getAll()
      set(() => ({ blogs }))
    },
    createBlog: async (blogObject) => {
      const created = await blogService.create(blogObject)
      set((state) => ({ blogs: state.blogs.concat(created) }))
      return created
    },
    blogCreated: (blog) => {
      set((state) => ({ blogs: state.blogs.concat(blog) }))
    },
    likeBlog: async (blog) => {
      const updated = await blogService.update(blog.id, {
        ...blog,
        likes: blog.likes + 1,
        user: blog.user.id || blog.user,
      })
      set((state) => ({
        blogs: state.blogs.map((b) =>
          b.id !== blog.id ? b : { ...updated, user: blog.user }
        ),
      }))
    },
    removeBlog: async (id) => {
      await blogService.remove(id)
      set((state) => ({ blogs: state.blogs.filter((b) => b.id !== id) }))
    },
    addComment: async (id, comment) => {
      const updated = await blogService.addComment(id, comment)
      set((state) => ({
        blogs: state.blogs.map((b) => (b.id !== id ? b : updated)),
      }))
      return updated
    },
  },
}))

export const useBlogs = () => useBlogStore((state) => state.blogs)
export const useBlogActions = () => useBlogStore((state) => state.actions)

export default useBlogStore
