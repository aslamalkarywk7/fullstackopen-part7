import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, TextField } from '@mui/material'

const Blog = ({
  blog,
  user,
  onLike,
  onRemove,
  onAddComment,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [comment, setComment] = useState('')

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  }

  const showRemove = user && blog.user && blog.user.username === user.username

  const submitComment = (event) => {
    event.preventDefault()
    onAddComment(blog.id, comment)
    setComment('')
  }

  return (
    <div style={blogStyle} className="blog">
      <div className="blog-summary">
        <Link to={`/blogs/${blog.id}`}>
          {blog.title} {blog.author}
        </Link>
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? 'hide' : 'view'}
        </button>
      </div>
      {expanded && (
        <div className="blog-details">
          <div className="blog-url">{blog.url}</div>
          <div className="blog-likes">
            likes {blog.likes}
            {user && (
              <Button size="small" onClick={() => onLike(blog)}>
                like
              </Button>
            )}
          </div>
          <div>{blog.user.name}</div>
          {showRemove && <button onClick={() => onRemove(blog)}>remove</button>}
          <h4>comments</h4>
          <form onSubmit={submitComment}>
            <label>
              comment
              <TextField
                size="small"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
            </label>
            <Button size="small" type="submit">
              add comment
            </Button>
          </form>
          <ul>
            {(blog.comments || []).map((c, index) => (
              <li key={index}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Blog
