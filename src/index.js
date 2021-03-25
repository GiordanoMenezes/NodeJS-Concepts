const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const existUser = users.find((usr) => usr.username === username);

  if (!existUser) {
    return response
      .status(400)
      .json({ error: `The ${username} user doesn't exists!` });
  }
  request.user = existUser;
  return next();
}

app.post("/users", (request, response) => {
  const user = request.body;

  const finduser = users.some((usr) => usr.username === user.username);

  if (finduser) {
    return response.status(400).json({ error: "The user already exists!" });
  }

  const newuser = {
    ...user,
    id: uuidv4(),
    todos: [],
  };

  users.push(newuser);

  return response.status(201).json(newuser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((td) => td.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Id de tarefa não encontrado!" });
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const findtodo = user.todos.find((td) => td.id === id);

  if (!findtodo) {
    return response.status(404).json({ error: "Id de tarefa não encontrado!" });
  }
  findtodo.done = true;

  return response.status(200).json(findtodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  const findtodo = user.todos.find((td) => td.id === id);

  if (!findtodo) {
    return response.status(404).json({ error: "Id de tarefa não encontrado!" });
  }
  user.todos.splice(findtodo, 1);
  return response
    .status(204)
    .json({ message: `Tarefa ${findtodo.title} excluída com sucesso!` });
});

module.exports = app;
