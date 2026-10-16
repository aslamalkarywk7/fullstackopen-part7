import { useState, useEffect } from 'react'
import anecdoteService from '../services/anecdotes'

export const useField = (type) => {
  const [value, setValue] = useState('')

  const onChange = (event) => {
    setValue(event.target.value)
  }

  const reset = () => {
    setValue('')
  }

  return {
    type,
    value,
    onChange,
    reset,
  }
}

export const useAnecdotes = () => {
  const [anecdotes, setAnecdotes] = useState([])

  useEffect(() => {
    anecdoteService.getAll().then((data) => setAnecdotes(data))
  }, [])

  const addAnecdote = async (anecdote) => {
    const created = await anecdoteService.createNew({
      ...anecdote,
      votes: 0,
    })
    setAnecdotes((prev) => [...prev, created])
  }

  const deleteAnecdote = async (id) => {
    await anecdoteService.deleteAnecdote(id)
    setAnecdotes((prev) =>
      prev.filter((anecdote) => String(anecdote.id) !== String(id))
    )
  }

  return { anecdotes, addAnecdote, deleteAnecdote }
}
