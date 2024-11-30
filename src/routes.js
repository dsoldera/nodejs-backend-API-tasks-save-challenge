import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {    
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', {
        title: search,
        description: search
      })

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'GET',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id})

      if (!task) {
        return res.writeHead(404).end(
          JSON.stringify({ message: 'Task nao localizada' })
        )
      }

      return res.end(JSON.stringify(task))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      if (!title) {
        return res
          .writeHead(400)
          .end(
          JSON.stringify({ message: 'O campo title é obrigatorio' }),
        );
      }

      if (!description) {
        return res
          .writeHead(400)
          .end(
          JSON.stringify({message: 'O campo descrição é obrigatorio' })
        );
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      }

      database.insert('tasks', task) // insert at the database

      return res
        .writeHead(201)
        .end(JSON.stringify({ message: 'Task criada com sucesso!'}))
    },
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: 'Task nao localizada' }))
      }

      if (!title || !description) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: 'O campo title e a descrição são obrigatórios!' }))
      }

      database.update('tasks', id, {
        title: title ?? task.title,
        description: description ?? task.description,
        updated_at: new Date()
      })

      return res
        .writeHead(204)
        .end(JSON.stringify({ message: 'Task atualizada com sucesso!' }))
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end()
      }

      database.delete('tasks', id) // deleted the task

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ message: 'Task nao localizada' }))
      }

      const isTaskCompleted = !!task.completed_at
      const completed_at = isTaskCompleted ? null : new Date()

      database.update('tasks', id, { completed_at })

      return res
        .writeHead(204)
        .end(JSON.stringify({ message: 'Task atualizada com sucesso!' }))
    }
  }
]
