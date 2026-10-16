import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('form calls event handler with the right details', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)

  await user.type(screen.getByPlaceholderText('write title here'), 'Test title')
  await user.type(
    screen.getByPlaceholderText('write author here'),
    'Test author'
  )
  await user.type(
    screen.getByPlaceholderText('write url here'),
    'http://test.url/'
  )
  await user.click(screen.getByText('create'))

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0]).toEqual({
    title: 'Test title',
    author: 'Test author',
    url: 'http://test.url/',
  })
})
