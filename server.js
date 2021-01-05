const express = require('express'); 
const knex = require('knex');
const bodyParser = require("body-parser");

// Express instance
const app = express();

// Database connection
const db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL
});

// Create table if it doesn't exist
db.schema.hasTable('task').then(hasTable => {
    if (!hasTable) {
        console.log("database doesn't have the task table, creating");
        db.schema.createTable('task', (table) => {
            table.increments('id').primary().notNullable();
            table.string('task').unique();
            table.integer('status').defaultTo(0);
        }).then(_=> {
            console.log("table created!");
        }).catch(err => console.log(err));
    }
});

// Express settings
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static("public"));

// GET /
app.get("/", (req, res) => {
    db.select("*").from("task").then(data => {
        res.render('index', {todos: data});
    }).catch(err => res.status(400).json(err));
});

// POST /addTask
app.post("/addTask", (req, res) => {
    const {textTodo} = req.body;
    db("task").insert({task: textTodo}).returning("*").then(_=> {
        res.redirect("/");
    }).catch(e => {
        res.status(400).json({message: "unable to create a new todo task"});
    });
});

// PUT /moveTaskDone
app.put("/moveTaskDone", (req, res) =>{
    const { name, id } = req.body;
    if (name === "todo") {
        db("task")
            .where("id", "=", id)
            .update("status", 1)
            .returning("status")
            .then(task => {
                res.json(task[0])
            });
    }
    else if (name === "done") {
        db("task") 
            .where("id", "=", id)
            .update("status", 0)
            .returning("status")
            .then(task => {
                res.json(task[0])
            });
    }
    else {
        res.status(400).json({message: "unable to update task status"});
    }
});

app.listen(8080, () => console.log('app is running on port 8080'));