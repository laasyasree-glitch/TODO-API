const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "todoApplication.db");

const app = express();

let db = null;

const initializeServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }

  app.listen(3006, () => {
    console.log("Local Host Server started at 3006");
  });
};

initializeServerAndDb();

app.get("/todos/", async (req, res) => {
  const { search_q = "", status = "", priority = "" } = req.query;
  const getAllSQLQuery = `SELECT * FROM todo 
  WHERE todo like '%${search_q}%' and STATUS LIKE '%${status}%' AND priority LIKE '%${priority}%'`;

  const result = await db.all(getAllSQLQuery);
  res.send(result);
});

app.get("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const { search_q = "", status = "", priority = "" } = req.query;
  const getAllSQLQuery = `SELECT * FROM todo 
  WHERE id=${todoId} and todo like '%${search_q}%' and STATUS LIKE '%${status}%' AND priority LIKE '%${priority}%'`;

  const result = await db.get(getAllSQLQuery);
  res.send(result);
});

app.use(express.json());

app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status } = req.body;
  const postSQLQuery = `INSERT INTO TODO (id, todo, priority, status) 
    VALUES (${id}, '${todo}', '${priority}', '${status}')`;

  await db.get(postSQLQuery);
  res.send("Todo Successfully Added");
});

const hasPriorityProperty = (priority) => {
  return priority !== undefined;
};

const hasStatusProperty = (status) => {
  return status !== undefined;
};

const hasTodoProperty = (todo) => {
  return todo !== undefined;
};

app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const { status, priority, todo } = req.body;

  const statusCheck = hasStatusProperty(status);
  const priorityCheck = hasPriorityProperty(priority);
  const todoCheck = hasTodoProperty(todo);
  console.log(statusCheck, priorityCheck, todoCheck);
  let putSQLQuery = null;
  let statement = null;

  if (statusCheck && priorityCheck) {
    putSQLQuery = `UPDATE TODO
     SET STATUS='${status}', priority='${priority}'  where id=${todoId}`;
    statement = "Both Status and Priority Updated";
  } else {
    if (statusCheck) {
      putSQLQuery = `UPDATE TODO
     SET STATUS='${status}'  where id=${todoId}`;
      statement = "Status Updated";
    }
    if (priorityCheck) {
      putSQLQuery = `UPDATE TODO  set priority='${priority}'  where id=${todoId}`;
      statement = "Priority Updated";
    }
    if (todoCheck) {
      putSQLQuery = `UPDATE TODO  set todo='${todo}'  where id=${todoId}`;
      statement = "Todo Updated";
    }
  }

  await db.run(putSQLQuery);
  res.send(statement);
});

app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const delQuery = `delete from todo where id=${todoId}`;
  await db.run(delQuery);
  res.send("Todo Deleted");
});
module.exports = app;
