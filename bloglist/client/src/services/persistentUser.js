const KEY = 'loggedBlogappUser'

export const getUser = () => {
  const userJSON = window.localStorage.getItem(KEY)
  return userJSON ? JSON.parse(userJSON) : null
}

export const saveUser = (user) => {
  window.localStorage.setItem(KEY, JSON.stringify(user))
}

export const removeUser = () => {
  window.localStorage.removeItem(KEY)
}
