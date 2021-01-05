const express = require('express'); 
const knex = require('knex');
const bodyParser = require("body-parser");

const app = express();

const db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL
});

// Express settings
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    db.select("*").from("task").then(data => {
        res.render('index', {todos: data});
    }).catch(err => res.status(400).json(err));
});

app.post("/addTodo", (req, res) => {
    const {textTodo} = req.body;
    db("task").insert({task: textTodo}).returning("*").then(_=> {
        res.redirect("/");
    }).catch(e => {
        res.status(400).json({message: "unable to create a new todo task"});
    });
});

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