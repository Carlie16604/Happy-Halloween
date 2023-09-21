const pg = require("pg")
const client = new pg.Client('postgres://localhost/halloween')
const express = require("express")
const app = express()
const cors = require("cors")
app.use(cors())

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
        res.send(response.rows[0])
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