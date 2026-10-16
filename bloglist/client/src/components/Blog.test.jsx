import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Blog from './Blog'

const blog = {
  title: 'React patterns',
  author: 'Michael Chan',
  url: 'https://reactpatterns.com/',
  likes: 7,
  user: { username: 'mluukkai', name: 'Matti Luukkainen' },
}

const creator = { username: 'mluukkai', name: 'Matti Luukkainen' }
const otherUser = { username: 'other', name: 'Other User' }

test('renders title and author but not url or likes by default', () => {
  render(
    <MemoryRouter>
      <Blog blog={blog} user={creator} onLike={() => {}} onRemove={() => {}} />
    </MemoryRouter>
  )

  screen.getByText('React patterns Michael Chan')
  expect(screen.queryByText('https://reactpatterns.com/')).toBeNull()
  expect(screen.queryByText('likes 7')).toBeNull()
})

test('url and likes are shown after clicking view', async () => {
  render(
    <MemoryRouter>
      <Blog blog={blog} user={creator} onLike={() => {}} onRemove={() => {}} />
    </MemoryRouter>
  )

  const user = userEvent.setup()
  await user.click(screen.getByText('view'))

  screen.getByText('https://reactpatterns.com/')
  screen.getByText('likes 7')
})

test('like button calls handler twice when clicked twice', async () => {
  const onLike = vi.fn()
  render(
    <MemoryRouter>
      <Blog blog={blog} user={creator} onLike={onLike} onRemove={() => {}} />
    </MemoryRouter>
  )

  const user = userEvent.setup()
  await user.click(screen.getByText('view'))
  await user.click(screen.getByText('like'))
  await user.click(screen.getByText('like'))

  expect(onLike.mock.calls).toHaveLength(2)
})

test('unauthenticated users see info but no buttons', async () => {
  render(
    <MemoryRouter>
      <Blog blog={blog} user={null} onLike={() => {}} onRemove={() => {}} />
    </MemoryRouter>
  )

  const user = userEvent.setup()
  await user.click(screen.getByText('view'))

  screen.getByText('https://reactpatterns.com/')
  screen.getByText('likes 7')
  expect(screen.queryByText('like')).toBeNull()
  expect(screen.queryByText('remove')).toBeNull()
})

test('non-creator sees like button but not remove button', async () => {
  render(
    <MemoryRouter>
      <Blog
        blog={blog}
        user={otherUser}
        onLike={() => {}}
        onRemove={() => {}}
      />
    </MemoryRouter>
  )

  const user = userEvent.setup()
  await user.click(screen.getByText('view'))

  screen.getByText('like')
  expect(screen.queryByText('remove')).toBeNull()
})

test('creator sees both like and remove buttons', async () => {
  render(
    <MemoryRouter>
      <Blog blog={blog} user={creator} onLike={() => {}} onRemove={() => {}} />
    </MemoryRouter>
  )

  const user = userEvent.setup()
  await user.click(screen.getByText('view'))

  screen.getByText('like')
  screen.getByText('remove')
})
