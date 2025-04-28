//AO INICIAR UM ARQUIVO JS SEMPRE DECLARE UMA VARIAVEL DE SUA BIBLIOTECA
const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3");

const app = express(); //Armazena as chamadas e propriedades da biblioteca EXPRESS

const PORT = 8000;

app.use('/static', express.static(__dirname + '/static'))

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    console.log("GET /")
    res.render("index");
})

app.get("/sobre", (req, res) => {
    console.log("GET /sobre")
    res.render("sobre");
})

app.listen(PORT, () => {
    console.log(`Servidor sendo excexutado na porta ${PORT}`)
    console.log(__dirname + "\\static")
});


