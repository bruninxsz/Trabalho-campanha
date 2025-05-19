//AO INICIAR UM ARQUIVO JS SEMPRE DECLARE UMA VARIAVEL DE SUA BIBLIOTECA
const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3");
// const bodyparser = require("body-parser") //Até a versão 4 é necessario usar esse codigo

const app = express(); //Armazena as chamadas e propriedades da biblioteca EXPRESS

const PORT = 8000;

//Conexão com o Banco de Dados
const db = new sqlite3.Database("users.db");
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)"
  );
});

app.use(
  session({
    secret: "senhaforte",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/static", express.static(__dirname + "/static"));

//Configuração do Express para processar requisições POST com BODY PARAMETERS
app.use(express.urlencoded({ extended: true })); // Versão Express >= 5.x.x

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  console.log("GET /");
  res.render("pages/index", { titulo: "Index", req: req });
});

app.get("/sobre", (req, res) => {
  console.log("GET /sobre");
  res.render("pages/sobre", { titulo: "Sobre", req: req });
});

app.get("/login", (req, res) => {
  console.log("GET /login");
  res.render("pages/login", { titulo: "Login" });
});

//Rota /login para processamento dos dados do formulário de LOGIN no cliente
app.post("/login", (req, res) => {
  console.log("POST /login");
  console.log(JSON.stringify(req.body));
  const { username, password } = req.body;

  const query = `SELECT * FROM users WHERE username=? AND password=?`;

  db.get(query, [username, password], (err, row) => {
    if (err) throw err; //SE OCORRER O ERRO VÁ PARA O RESTO DO CÓDIGO

    //1. Verificar se o usuário existe
    console.log(JSON.stringify(row));
    if (row) {
      //2. Se o usuário existir e a senha é válida no BD, executar o processo de login
      req.session.username = row.username;
      req.session.loggedin = true;
      res.redirect("/dashboard");
    } else {
      //3. Se não, executar processo de negação de login
      res.redirect("/user-senha-invalido");
    }
  });
  // res.render("pages/login")
});

app.get ("/user-senha-invalido", (req,res)=>{
    res.render ("pages/user-senha-invalido", {titulo: "Usuario Senha Invalidos"})
})

app.get("/cadastro", (req, res) => {
  console.log("GET /cadastro");
  res.render("pages/cadastro", { titulo: "Cadastro" });
});

app.post("/cadastro", (req, res) => {
  console.log("POST /cadastro");
  console.log(JSON.stringify(req.body));
  const { username, password } = req.body;

  const query1 = `SELECT * FROM users WHERE username=?`;
  const query2 = `INSERT INTO users (username, password) VALUES (? , ?)`;

  db.get(query1, [username], (err, row) => {
    if (err) throw err; //SE OCORRER O ERRO VÁ PARA O RESTO DO CÓDIGO

    //1. Verificar se o usuário existe
    console.log(JSON.stringify(row));
    if (row) {
      //2. Se o usuário existir Negar o Cadastro
      console.log(`Usuario ${username} já cadastrado`);
      res.redirect("/usuario-ja-cadastrado");
    } else {
      //3. Se não, fazer o insert
      db.get(query2, [username, password], (err, row) => {
        if (err) throw err; //SE OCORRER O ERRO VÁ PARA O RESTO DO CÓDIGO

        //1. Verificar se o usuário existe
        console.log(JSON.stringify(row));
        console.log(`Usuário ${username} cadastrado com sucesso`);
        res.redirect("/usuario-cadastrado");
      });
    }
  });
});

app.get ("/usuario-cadastrado", (req,res) =>{
    res.render ("pages/usuario-cadastrado", {titulo:"Usuario Cadastrado"})
})

app.get ("/usuario-ja-cadastrado", (req,res) =>{
    res.render ("pages/usuario-ja-cadastrado", {titulo:"Usuario Ja Cadastrado"})
})

app.get("/dashboard", (req, res) => {
  console.log("GET /dashboard");

  if (req.session.loggedin) {
    //Listar todos os Usuários
    const query = "SELECT * FROM users";
    db.all(query, [], (err, row) => {
      if (err) throw err;
      // Renderiza a Página dashboard com a lista de usuário coletada no BD
      res.render("pages/dashboard", {
        titulo: "Dashboard",
        dados: row,
        req: req,
      });
    });
  } else {
    tituloError = "Não Autorizado";
    res.redirect("/nao-autorizado");
  }

  // res.render("pages/dashboard", {titulo: "Dashboard"});
});

app.get("/nao-autorizado", (req, res) => {
    console.log("GET /nao-autorizado")
    res.render ("pages/nao-autorizado", {titulo: "Não Autorizado" })
})

app.get("/logout", (req, res) => {
  console.log("GET /logout");
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.use('/{*erro}', (req, res) => {
    // Envia uma resposta de erro 404
    res.status(404).render('pages/fail', {titulo: "ERRO 404",req: req, msg: "404"});
});

app.listen(PORT, () => {
  console.log(`Servidor sendo excexutado na porta ${PORT}`);
  console.log(__dirname + "\\static");
});