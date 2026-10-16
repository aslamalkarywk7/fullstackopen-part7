import { TextField, Button } from '@mui/material'
import { useField } from '../hooks/useField'

const LoginForm = ({ handleSubmit }) => {
  const { reset: resetUsername, ...username } = useField('text')
  const { reset: resetPassword, ...password } = useField('password')

  const onSubmit = (event) => {
    event.preventDefault()
    handleSubmit(username.value, password.value)
    resetUsername()
    resetPassword()
  }

  return (
    <div>
      <h2>log in to application</h2>
      <form onSubmit={onSubmit}>
        <div>
          <TextField label="username" {...username} />
        </div>
        <div>
          <TextField label="password" {...password} />
        </div>
        <div>
          <Button type="submit" variant="contained" style={{ marginTop: 10 }}>
            login
          </Button>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
