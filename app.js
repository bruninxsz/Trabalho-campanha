//AO INICIAR UM ARQUIVO JS SEMPRE DECLARE UMA VARIAVEL DE SUA BIBLIOTECA
const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require('body-parser')
// const bodyparser = require("body-parser") //Até a versão 4 é necessario usar esse codigo

const app = express(); //Armazena as chamadas e propriedades da biblioteca EXPRESS

app.use(helmet())
app.use(cors({
  origin: "https://google.com.br",
  origin: "https://www.bing.com/"
}))
app.use(bodyParser.json({limit: "3mb"}))

const PORT = 8000;

//Conexão com o Banco de Dados
const db = new sqlite3.Database("users.db");
db.serialize(() => {
   db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, ativo INTEGER, perfil TEXT(3))"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS Pontuacao_Itens (id INTEGER PRIMARY KEY AUTOINCREMENT, Descricao TEXT, pontos INTEGER)"
  );
   db.run(
    "CREATE TABLE IF NOT EXISTS Turmas (id_turma INTEGER PRIMARY KEY AUTOINCREMENT, sigla TEXT, docente TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS Arrecadacoes (id_arrecadacao INTEGER PRIMARY KEY AUTOINCREMENT, id_turma INTEGER, id_Item INTEGER, id_Campanha INTEGER, qtd INTEGER, data TEXT)"
  );
  
  db.run(
    "CREATE TABLE IF NOT EXISTS Campanhas (id_Campanha INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT, conteudo TEXT, ativo INTEGER)"
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

app.get("/nova-arrecadacao", (req, res) => {
 if (req.session.adm) {
    console.log("GET /nova-arrecadacao");
const query = "SELECT * FROM Turmas";
const query2 = "SELECT * FROM Pontuacao_Roupas";

// Primeiro obtemos os dados de ambas as tabelas
db.all(query, [], (err, turmas) => {
  if (err) throw err;
  
  db.all(query2, [], (err, pontuacoes) => {
    if (err) throw err;
    
    // Só renderizamos a página quando temos todos os dados
    res.render("pages/nova-arrecadacao", { 
      titulo: "Nova Doação", 
      req: req, 
      turmas: turmas, 
      pontuacoes: pontuacoes 
    });
  });
});
  } else {
    tituloError = "Não Autorizado";
    res.redirect("/nao-autorizado");
  }
});

app.post("/nova-arrecadacao", (req, res) => {
  console.log("POST /nova-arrecadacao");
  // Pegar dados da postagem: User ID, Titulo, Conteudo, Data da Postagem
  //req.session.username, req.session.id
  if (req.session.adm) {
    const {id_turma, id_roupa, qtd } = req.body;
    const query = `INSERT INTO Arrecadacoes (id_turma, id_roupa, qtd, data) VALUES (?, ? , ?, ?)`;
    const data = new Date();
    const data_atual = data.toLocaleDateString();
    console.log(JSON.stringify(req.body));
    console.log(JSON.stringify(data_atual));
    
    db.get(query, [id_turma ,id_roupa, qtd, data_atual], (err, row) => {
      if (err) throw err; //SE OCORRER O ERRO VÁ PARA O RESTO DO CÓDIGO
      //1. Verificar se o usuário existe
      console.log(JSON.stringify(row));
      res.redirect("/nova-arrecadacao")
    });
  
  } else {
    res.redirect("/nao-autorizado");
  }
});


// Inicia o servidor
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

app.get("/login", (req, res) => {
  console.log("GET /login");
  res.render("pages/login", { titulo: "Login" });
});

//Rota /login para processamento dos dados do formulário de LOGIN no cliente
app.post("/login", (req, res) => {
  console.log("POST /login");
  console.log(JSON.stringify(req.body));
  const { username, password, perfil} = req.body;

  const query = `SELECT * FROM users WHERE username=? AND password=?`;

  db.get(query, [username, password], (err, row) => {
    if (err) throw err; //SE OCORRER O ERRO VÁ PARA O RESTO DO CÓDIGO

    //1. Verificar se o usuário existe
    console.log(JSON.stringify(row));
    if (row) {
      //2. Se o usuário existir e a senha é válida no BD, executar o processo de login
      req.session.username = username;
      req.session.perfil = perfil;
      req.session.loggedin = true;
      req.session.id_username = row.id;
      if(row.perfil == "ADM"){
      req.session.adm = true;
      res.redirect("/dashboard");
      }
      else{
      req.session.adm = false;
      res.redirect("/");
      }
    } else {
      //3. Se não, executar processo de negação de login
      res.redirect("/user-senha-invalido");
    }
  });
  // res.render("pages/login")
});

app.get("/user-senha-invalido", (req, res) => {
  res.render("pages/user-senha-invalido", {
    titulo: "Usuario Senha Invalidos",
  });
});

app.get("/cadastro", (req, res) => {
  console.log("GET /cadastro");
  res.render("pages/cadastro", { titulo: "Cadastro" });
});

app.post("/cadastro", (req, res) => {
  console.log("POST /cadastro");
  console.log(JSON.stringify(req.body));
  const { username, password } = req.body;

  const query1 = `SELECT * FROM users WHERE username=?`;
  const query2 = `INSERT INTO users (username, password, ativo, perfil) VALUES (? , ?, ?, ?)`;
  const ativo = 1;
  const perfil = "USR";
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
      db.get(query2, [username, password, ativo, perfil], (err, row) => {
        if (err) throw err; //SE OCORRER O ERRO VÁ PARA O RESTO DO CÓDIGO

        //1. Verificar se o usuário existe
        console.log(JSON.stringify(row));
        console.log(`Usuário ${username} cadastrado com sucesso`);
        res.redirect("/usuario-cadastrado");
      });
    }
  });
});

app.get("/usuario-cadastrado", (req, res) => {
  res.render("pages/usuario-cadastrado", { titulo: "Usuario Cadastrado" });
});

app.get("/usuario-ja-cadastrado", (req, res) => {
  res.render("pages/usuario-ja-cadastrado", {
    titulo: "Usuario Ja Cadastrado",
  });
});

app.get("/dashboard", (req, res) => {
  if(req.session.loggedin){
  const query = `
    SELECT 
      Turmas.id_turma,
      Turmas.sigla,
      Turmas.docente,
      IFNULL(SUM(Pontuacao_Roupas.pontos * Arrecadacoes.qtd), 0) AS pontos
    FROM Turmas
    LEFT JOIN Arrecadacoes ON Arrecadacoes.id_turma = Turmas.id_turma
    LEFT JOIN Pontuacao_Roupas ON Pontuacao_Roupas.id = Arrecadacoes.id_Roupa
    GROUP BY Turmas.id_turma
    ORDER BY pontos DESC;
  `;

  db.all(query, [], (err, resultado) => {
    if (err) {
      console.error("Erro no banco:", err);
      return res.status(500).send("Erro no servidor");
    }

    res.render("pages/dashboard", {
      titulo: "Dashboard",
      selectTurmas: resultado,
      req: req
    });
  });
}else {
  res.redirect("/nao-permitido")
}});

app.get("/nao-permitido", (req, res) => {
  console.log("GET /nao-permitido");
  res.render("pages/nao-permitido", { titulo: "Não Permitido" });
});

app.get("/nao-autorizado", (req, res) => {
  console.log("GET /nao-autorizado");
  res.render("pages/nao-autorizado", { titulo: "Não Autorizado" });
});

app.get("/logout", (req, res) => {
  console.log("GET /logout");
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.use("/{*erro}", (req, res) => {
  // Envia uma resposta de erro 404
  res
  .status(404)
  .render("pages/fail", { titulo: "ERRO 404", req: req, msg: "404" });
});

app.listen(PORT, () => {
  console.log(`Servidor sendo excexutado na porta ${PORT}`);
  console.log(__dirname + "\\static");
});