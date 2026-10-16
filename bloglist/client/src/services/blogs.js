import axios from 'axios'

const baseUrl = '/api/blogs'

let token = null

const setToken = (newToken) => {
  token = `Bearer ${newToken}`
}

const getAll = () => axios.get(baseUrl).then((response) => response.data)

const create = async (newObject) => {
  const config = { headers: { Authorization: token } }
  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = (id, newObject) =>
  axios.put(`${baseUrl}/${id}`, newObject).then((response) => response.data)

const remove = async (id) => {
  const config = { headers: { Authorization: token } }
  const response = await axios.delete(`${baseUrl}/${id}`, config)
  return response.data
}

const addComment = async (id, comment) => {
  const response = await axios.post(`${baseUrl}/${id}/comments`, { comment })
  return response.data
}

export default { getAll, create, update, remove, addComment, setToken }
