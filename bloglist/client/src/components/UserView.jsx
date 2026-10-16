import { useState, useEffect } from 'react'
import { useMatch } from 'react-router-dom'
import userService from '../services/users'
import NotFound from './NotFound'

const UserView = () => {
  const [users, setUsers] = useState([])
  const match = useMatch('/users/:id')
  const user = match ? users.find((u) => u.id === match.params.id) : null

  useEffect(() => {
    userService.getAll().then((initialUsers) => {
      setUsers(initialUsers)
    })
  }, [])

  if (!user) {
    return <NotFound />
  }

  return (
    <div>
      <h2>{user.name}</h2>
      <h3>added blogs</h3>
      <ul>
        {user.blogs.map((blog) => (
          <li key={blog.id}>{blog.title}</li>
        ))}
      </ul>
    </div>
  )
}

export default UserView
