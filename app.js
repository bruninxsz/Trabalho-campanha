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
app.use(bodyParser.json({ limit: "3mb" }))

const PORT = 8000;

//Conexão com o Banco de Dados
const db = new sqlite3.Database("users.db");
const titulo = "Campanha de higiene";
const conteudo = "Arrecadação de itens de higiene para pessoas carentes.";
const ativo = 1; // 1 = ativa, 0 = inativa

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, ativo INTEGER, perfil TEXT(3))"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS Pontuacao_Itens (id INTEGER PRIMARY KEY AUTOINCREMENT, Descricao TEXT, id_campanha INTEGER, pontos INTEGER)"
  );
   db.run(
    "CREATE TABLE IF NOT EXISTS Turmas (id_turma INTEGER PRIMARY KEY AUTOINCREMENT, sigla TEXT, docente TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS Arrecadacoes (id_arrecadacao INTEGER PRIMARY KEY AUTOINCREMENT, id_turma INTEGER, id_Item INTEGER, id_Campanha INTEGER, qtd INTEGER, data INTEGER)"
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS Campanhas (id_Campanha INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT, conteudo TEXT, data INTEGER, ativo INTEGER)"
  );
 
  db.serialize(() => {
  // Usuário administrador
 async function inserirUsuarioSeNaoExistir(username, password, ativo, perfil, tipo) {
    return new Promise((resolve, reject) => {
        // Primeiro verifica se o usuário já existe
        db.get(
            "SELECT id FROM users WHERE username = ?",
            [username],
            function (err, row) {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (row) {
                    console.log(`${tipo} já existe no banco de dados.`);
                    resolve(false);
                } else {
                    // Se não existe, faz o insert
                    db.run(
                        "INSERT INTO users (username, password, ativo, perfil) VALUES (?, ?, ?, ?)",
                        [username, password, ativo, perfil],
                        function (err) {
                            if (err) {
                                reject(err);
                            } else {
                                console.log(`${tipo} inserido com sucesso! ID:`, this.lastID);
                                resolve(true);
                            }
                        }
                    );
                }
            }
        );
    });
}

// Uso
inserirUsuarioSeNaoExistir("adm", "adm123", 1, "ADM", "Administrador")
    .catch(err => console.error("Erro:", err.message));

inserirUsuarioSeNaoExistir("usuario", "usuario123", 1, "USR", "Usuário comum")
    .catch(err => console.error("Erro:", err.message));
});  
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
  if (req.session.adm || req.session.pro) {
    console.log("GET /nova-arrecadacao");
    const query = "SELECT * FROM Turmas";
    const query2 = "SELECT * FROM Pontuacao_Itens";

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
  if (req.session.adm || req.session.pro) {
    const { id_turma, id_roupa, qtd } = req.body;
    const query = `INSERT INTO Arrecadacoes (id_turma, id_Item, qtd, data) VALUES (?, ? , ?, ?)`;
    const data = new Date();
    const data_atual = data.toLocaleDateString();
    console.log(JSON.stringify(req.body));
    console.log(JSON.stringify(data_atual));

    db.get(query, [id_turma, id_roupa, qtd, data_atual], (err, row) => {
      if (err) throw err; //SE OCORRER O ERRO VÁ PARA O RESTO DO CÓDIGO
      //1. Verificar se o usuário existe
      console.log(JSON.stringify(row));
      res.redirect("/nova-arrecadacao")
    });

  } else {
    res.redirect("/nao-autorizado");
  }
});


 app.get("/criacao_Pontuacao_Itens", (req, res) => {
  console.log("GET /criacao_Pontuacao_Itens");
  if (req.session.adm) {
    // Envia o formulário HTML
    res.send(`
      <!DOCTYPE html>
<html>
<head>
    <title>Cadastrar Item</title>
    <meta charset="UTF-8">
</head>
<body>
    <h2>Cadastrar Novo Item</h2>
    <form action="/criacao_Pontuacao_Itens" method="POST">
        <label>Descrição:</label>
        <input type="text" name="Descricao" placeholder="Digite a descrição" required>
        <br><br>
        <label>ID Campanha:</label>
        <input type="number" name="id_campanhas" placeholder="Digite o ID da campanha" required>
        <br><br>
        <label>Pontos:</label>
        <input type="number" name="pontos" placeholder="Digite os pontos" required>
        <br><br>
        <button type="submit">Cadastrar Item</button>
    </form>
    <br>
    <a href="/item-cadastrado">Ver itens cadastrados</a>
</body>
</html>
    `);
  } else {
    res.redirect("/acesso-nao-autorizado");
  }
});

app.post("/criacao_Pontuacao_Itens", (req, res) => {
  console.log("POST /criacao_Pontuacao_Itens");
  
  if (req.session.adm) {
    const { Descricao, id_campanhas, pontos } = req.body;
    
    console.log("Dados do formulário:", { Descricao, id_campanhas, pontos });
    
    // Validação dos dados
    if (!Descricao || !id_campanhas || !pontos) {
      console.error("Dados faltando!");
      return res.redirect("/erro-cadastro-item");
    }
    
    const query = `INSERT INTO Pontuacao_Itens (Descricao, id_campanha, pontos) VALUES (?, ?, ?)`;
    
    db.run(query, [Descricao, id_campanhas, pontos], function(err) {
      if (err) {
        console.error("Erro ao inserir item:", err);
        return res.redirect("/erro-cadastro-item");
      }
      
      console.log(`Item inserido com ID: ${this.lastID}`);
      // Redireciona para uma página de sucesso
      res.redirect("/item-cadastrado");
    });
  
  } else {
    res.redirect("/acesso-nao-autorizado");
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
  const { username, password, perfil } = req.body;

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

      if (row.perfil === "ADM") {
        req.session.adm = true;
        req.session.pro = false;
        req.session.usr = false;
      } else if (row.perfil === "PRO") {
        req.session.pro = true;
        req.session.adm = false;
        req.session.usr = false;
      } else if (row.perfil === "USR") {
        req.session.adm = false;
        req.session.pro = false;
        req.session.usr = true;
      } else {
        req.session.adm = false;
        req.session.pro = false;
        req.session.usr = false;
      }

      res.redirect("/");
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
  if (req.session.adm) {
    console.log("GET /cadastro");
    res.render("pages/cadastro", { titulo: "Cadastro" });
  } else {
    res.redirect("/nao-autorizado");
  };
});

app.get("/criacao_campanha", (req, res) => {
  if (req.session.adm) {
    console.log("GET /criacao_campanha");

    res.render("pages/criacao_campanha", {
      titulo: "Nova Campanha",
      req: req
    });
  } else {
    tituloError = "Não Autorizado";
    res.redirect("/nao-autorizado");
  }
});

app.post("/criacao_campanha", (req, res) => {
  if (req.session.adm) {
    console.log("POST /criacao_campanha");
    console.log(JSON.stringify(req.body));
    const { titulo, conteudo } = req.body;

    const query1 = `SELECT * FROM Campanhas WHERE titulo=?`;
    const query2 = `INSERT INTO Campanhas (titulo, conteudo, ativo) VALUES (? , ?, ?)`;
    const ativo = 1;
    // Consulta se a campanha já existe
    db.get(query1, [titulo], (err, row) => {
      if (err) throw err;

      console.log(JSON.stringify(row));

      if (row) {
        // Já existe -> impede o cadastro
        console.log(`Campanha ${titulo} já cadastrada`);
        res.redirect("/usuario-ja-cadastrado");
      } else {
        // Não existe -> insere nova
        db.run(query2, [titulo, conteudo, ativo], function (err) {
          if (err) throw err;

          console.log(`Campanha ${titulo} cadastrada com sucesso`);
          res.redirect("/campanhas_ativas");
        });
      }
    });
  } else {
    res.redirect("/nao-autorizado");
  };
});

app.get("/campanhas_ativas", (req, res) => {

  const query = `
    SELECT 
      Campanhas.id_Campanha,
      Campanhas.titulo,
      Campanhas.conteudo,
      Campanhas.ativo AS campanhas_ativas
    FROM Campanhas
    where Campanhas.ativo = 1;
    ORDER BY pontos DESC;
  `;

  db.all(query, [], (err, campanhas_ativas) => {
    if (err) {
      console.error("Erro no banco:", err);
      return res.status(500).send("Erro no servidor");
    }

    res.render("pages/campanhas_ativas", {
      titulo: "Campanhas ativas",
      selectCampanhas: campanhas_ativas,
      req: req
    });
  });
});

app.get("/criacao_itens", (req, res) => {
  if (req.session.adm) {
    console.log("GET /criacao_itens");

    res.render("pages/criacao_itens", {
      titulo: "Nova Doação",
      req: req
    });
  } else {
    tituloError = "Não Autorizado";
    res.redirect("/nao-autorizado");
  }
});

app.post("/cadastro", (req, res) => {
  if (req.session.adm) {
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
    })
  } else {
    res.redirect("/nao-autorizado");
  };
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
  if (req.session.usr || req.session.adm || req.session.pro) {
    const query = `
    SELECT 
      Turmas.id_turma,
      Turmas.sigla,
      Turmas.docente,
      IFNULL(SUM(Pontuacao_Itens.pontos * Arrecadacoes.qtd), 0) AS pontos
    FROM Turmas
    LEFT JOIN Arrecadacoes ON Arrecadacoes.id_turma = Turmas.id_turma
    LEFT JOIN Pontuacao_Itens ON Pontuacao_Itens.id = Arrecadacoes.id_Item
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
  } else {
    res.redirect("/nao-permitido")
  }
});

app.get("/Campanha_higiene", (req, res) => {
  if (req.session.loggedin) {
    const query = `
      SELECT 
        id_arrecadacao,
        turma,
        Item,
        Campanha,
        qtd,
        Pontos,
        data
      FROM Arrecadacoes_ficticio
    `;

    db.all(query, [], (err, resultado) => {
      if (err) {
        console.error("Erro no banco:", err);
        return res.status(500).send("Erro no servidor");
      }

      res.render("pages/Campanha_higiene", {
        titulo: "Campanhas",
        selectTurmas: resultado,
        req: req
      });
    });
  } else {
    res.redirect("/nao-permitido");
  }
});
app.get("/Campanhas", (req, res) => {
  if (req.session.loggedin) {
    const query = `
      SELECT 
        id_Campanha,
        titulo,
        conteudo
      FROM Campanhas
    `;

    db.all(query, [], (err, resultado) => {
      if (err) {
        console.error("Erro no banco:", err);
        return res.status(500).send("Erro no servidor");
      }

      res.render("pages/Campanhas", {
        titulo: "Campanhas",
        selectCampanhas: resultado,
        req: req
      });
    });
  } else {
    res.redirect("/nao-permitido");
  }
});


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