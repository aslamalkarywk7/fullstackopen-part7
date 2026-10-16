import { TextField, Button } from '@mui/material'
import { useField } from '../hooks/useField'

const BlogForm = ({ createBlog }) => {
  const { reset: resetTitle, ...title } = useField('text')
  const { reset: resetAuthor, ...author } = useField('text')
  const { reset: resetUrl, ...url } = useField('text')

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({ title: title.value, author: author.value, url: url.value })
    resetTitle()
    resetAuthor()
    resetUrl()
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={addBlog}>
        <div>
          <TextField label="title" placeholder="write title here" {...title} />
        </div>
        <div>
          <TextField
            label="author"
            placeholder="write author here"
            {...author}
          />
        </div>
        <div>
          <TextField label="url" placeholder="write url here" {...url} />
        </div>
        <div>
          <Button type="submit" variant="contained" style={{ marginTop: 10 }}>
            create
          </Button>
        </div>
      </form>
    </div>
  )
}

export default BlogForm
