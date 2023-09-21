const pg = require("pg")
const client = new pg.Client('postgres://localhost/halloween')
const express = require("express")
const app = express()
const cors = require("cors")
const morgan = require("morgan")
app.use(cors())
app.use(morgan("dev"))
app.use(express.json())

app.get('/api/halloween', async(req, res, next) => {
    try {
        const SQL = `
            SELECT *
            FROM halloween
        `;
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (error) {
        next(error) 
    }
});

app.get('/api/halloween/:id', async (req,res,next) => {
    try {
        const SQL = `
            SELECT *
            FROM halloween
            WHERE id=$1
        `;
        const response = await client.query(SQL, [req.params.id])
        if(response.rows.length === 0){
            throw new Error("ID does not exist dude")
        }
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
});

app.post('/api/halloween', async (req, res, next) => {
    const body = req.body
    // you dont actually need this ^^^
    try {
        const SQL = `
        INSERT INTO halloween(name, type, count)
        VALUES($1, $2, $3)
        RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name, req.body.type, req.body.count])
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
});

app.put('api/halloween', async (req,res, next) => {
    try {
        const SQL = `
            UPDATE halloween
            SET name = $1, type = $2, count = $3
            WHERE id=$4
            RETURNING *
        `;
        const response = await client.query(SQL, [req.body.name, req.body.type, req.body.count, req.params.id])
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
});

//error handling: custom 404 route
app.use('*', (req, res, next) => {
    res.status(404).send("Invalid Route Silly Goober")
});

//error handling: custom
app.use((err, req, res, next) => {
    console.log("error handler")
    res.status(500).send(err.message)
});

app.delete('api/halloween/:id', async (req,res,next) => {
    try {
        const SQL = `
            DELETE 
            FROM halloween
            WHERE id=$1
        `;
        const response = await client.query(SQL, [req.params.id])
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
});

const start = async() => {
    await client.connect()
    console.log("connected to db")
    const SQL = `
        DROP TABLE IF EXISTS halloween;
        CREATE TABLE halloween(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            type VARCHAR(100),
            count INT
        );
        INSERT INTO halloween (name, type, count) VALUES ('pumpkins', 'gord', 6);
        INSERT INTO halloween (name, type, count) VALUES ('spiders', 'arachnids', 30);
        INSERT INTO halloween (name, type, count) VALUES ('bats', 'mammals', 88);
        INSERT INTO halloween (name, type, count) VALUES ('ghosts', 'unknown', 1);
        INSERT INTO halloween (name, type, count) VALUES ('cats', 'feline', 3);
    `;
    await client.query(SQL)
    console.log("table seeded")
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
        console.log(`listening on ${PORT}`)
    })
}
 
start()