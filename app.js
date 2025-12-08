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
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, ativo INTGER, perfil TEXT(3))"
  )
  db.run(`
  CREATE TABLE IF NOT EXISTS Turmas (id_turma INTEGER PRIMARY KEY AUTOINCREMENT, sigla TEXT UNIQUE, docente TEXT)`
);

  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_turmas_sigla ON Turmas(sigla)`);

  db.run(
    "CREATE TABLE IF NOT EXISTS Arrecadacoes (id_arrecadacao INTEGER PRIMARY KEY AUTOINCREMENT, id_turma INTEGER, id_Item INTEGER, id_Campanha INTEGER, qtd INTEGER, data INTEGER)"
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS Campanhas (id_Campanha INTEGER PRIMARY KEY AUTOINCREMENT, titulo TEXT, conteudo TEXT, diasFaltando INTEGER, data_termino INTEGER, data_inicio INTEGER, ativo INTEGER)"
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS Pontuacao_Itens (id INTEGER PRIMARY KEY AUTOINCREMENT, Descricao TEXT, id_campanha INTEGER, pontos INTEGER)"
<<<<<<< HEAD
  );

// Inserir turmas apenas se não existirem
const turmas = [
  ['M1A', 'WILLIAM'],
  ['M3A', 'FABIO'],
  ['M3B', 'EPAMINONDAS'],
  ['M1C', 'ROGÉRIO POLETO'],
  ['M3D', 'WALDEMAR'],
  ['M1F', 'ALCINDO'],
  ['M1I', 'BRUNA'],
  ['M1IA', 'LUCAS / GABRIELA'],
  ['M1H', 'IZAIAS'],
  ['T1A', 'LUCIANO'],
  ['T1B', 'DENIS'],
  ['T1C', 'ROGÉRIO POLETO'],
  ['T1D', 'WALDEMAR'],
  ['T1IA', 'MARILIA'],
  ['T1I', 'LUCAS / JOSÉ AUGUSTO'],
  ['T3FA', 'ALEX'],
  ['T2FC', 'FERNANDO'],
  ['T3F', 'VITOR'],
  ['T1FB', 'BRUNO'],
  ['T1F', 'SERGIO'],
  ['T1FA', 'ALEX PENTEADO'],
  ['T1HS', 'MAYCON'],
  ['T1HSB', 'RICARDO'],
  ['T1E', 'JOÃO FLAVIO'],
  ['T2HS', 'ANA'],
  ['N1I', 'MARILIA'],
  ['N3F', 'EVANDRO'],
  ['N5F', 'PAULO']
];

const insertOrIgnoreTurma = (sigla, docente) => {
  return new Promise((resolve, reject) => {
    // Primeiro verifica se já existe
    db.get("SELECT sigla FROM Turmas WHERE sigla = ?", [sigla], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row) {
        console.log(`Turma ${sigla} já existe, ignorando inserção.`);
        resolve(false);
      } else {
        // Se não existe, insere
        db.run("INSERT INTO Turmas (sigla, docente) VALUES (?, ?)", [sigla, docente], function(err) {
          if (err) {
            reject(err);
          } else {
            console.log(`Turma ${sigla} inserida com sucesso! ID: ${this.lastID}`);
            resolve(true);
          }
        });
      }
=======
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
>>>>>>> 9eb1b25dcf2f8e94cfd76e8815fa314449befd2a
    });
  });
};

// Inserir turmas uma por uma
async function inserirTurmas() {
  for (const turma of turmas) {
    try {
      await insertOrIgnoreTurma(turma[0], turma[1]);
    } catch (err) {
      console.error(`Erro ao processar turma ${turma[0]}:`, err.message);
    }
  }
  console.log("Processamento de turmas concluído.");
}

// Chama a função para inserir turmas
inserirTurmas();


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


app.get("/criacao_Pontuacao_Itens", (req, res) => {
  console.log("GET /criacao_Pontuacao_Itens");
  res.render("pages/criacao_Pontuacao_Itens", { titulo: "criacao_Pontuacao_Itens", req: req });
});

app.post("/criacao_Pontuacao_Itens", (req, res) => {
  console.log("POST /criacao_Pontuacao_Itens");
  
  // Verificar se o usuário está logado como administrador
  if (!req.session.adm) {
    return res.redirect("/nao-autorizado");
  }
  
  const { Descricao, pontos, id_campanha } = req.body;
  
  // Validação básica dos dados
  if (!Descricao || !pontos || !id_campanha) {
    return res.send("Todos os campos são obrigatórios.");
  }
  
  const query = `
    INSERT INTO Pontuacao_Itens (Descricao, id_campanha, pontos)
    VALUES (?, ?, ?)
  `;
  
  db.run(query, [Descricao, id_campanha, pontos], function(err) {
    if (err) {
      console.error("Erro ao cadastrar item:", err);
      return res.status(500).send("Erro ao cadastrar item no banco de dados.");
    }
    
    console.log("Item cadastrado com sucesso! ID:", this.lastID);
    res.redirect("/item-cadastrado"); // Redireciona para a página de itens cadastrados
  });
});



app.get("/campanhas_ativas", (req, res) => {

  let sql = "SELECT * FROM Campanhas";

  db.all(sql, [], (erro, selectCampanhas) => {
    if (erro) {
      return res.send("Erro ao buscar campanhas.");
    }

    let agoraSegundos = Math.floor(Date.now() / 1000);
    let umDia = 86400;

    for (let i = 0; i < selectCampanhas.length; i++) {

      let termino = selectCampanhas[i].data_termino;

      if (!termino) {
        selectCampanhas[i].diasFaltando = 0;
        continue;
      }

      let diferenca = termino - agoraSegundos;
      let dias = Math.floor(diferenca / umDia);

      if (dias < 0) dias = 0;

      selectCampanhas[i].diasFaltando = dias;
    }

    res.render("pages/campanhas_ativas", {
      selectCampanhas: selectCampanhas,
      req: req,
      titulo: "Campanhas Ativas"
    });
  });
});


app.get("/sobre", (req, res) => {
  console.log("GET /sobre");
  res.render("pages/sobre", { titulo: "Sobre", req: req });
});

app.get("/nova-arrecadacao", (req, res) => {
  if (req.session.adm) {
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
  if (req.session.adm) {
    const { id_turma, id_Item, qtd } = req.body;

    const query = `
  INSERT INTO Arrecadacoes (id_turma, id_Item, qtd, data)
  VALUES (?, ?, ?, ?)
`;

    const data_atual = new Date().toLocaleDateString();

    db.run(query, [id_turma, id_Item, qtd, data_atual], function (err) {
      if (err) {
        console.error("Erro ao inserir arrecadação:", err);
        return res.status(500).send("Erro no servidor");
      }

      console.log("Arrecadação inserida! ID:", this.lastID);
      res.redirect("/nova-arrecadacao");
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
      if (row.perfil == "ADM") {
        req.session.adm = true;
        res.redirect("/dashboard");
      }
      else {
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

app.get("/criacao_campanha", (req, res) => {
  if (req.session.adm) {
    console.log("GET /criacao_campanha");
    const query = "SELECT * FROM Turmas";
    const query2 = "SELECT * FROM Pontuacao_Itens";

    // Primeiro obtemos os dados de ambas as tabelas
    db.all(query, [], (err, turmas) => {
      if (err) throw err;

      db.all(query2, [], (err, pontuacoes) => {
        if (err) throw err;

        // Só renderizamos a página quando temos todos os dados
        res.render("pages/criacao_campanha", {
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

app.post("/criacao_campanha", (req, res) => {
  if (!req.session.adm) return res.redirect("/nao-autorizado");

  console.log("POST /criacao_campanha");
  console.log(JSON.stringify(req.body));

  const { titulo, conteudo, inicio, termino } = req.body;

  const data_inicio = Math.floor(new Date(inicio).getTime() / 1000);
  const data_termino = Math.floor(new Date(termino).getTime() / 1000);

  const diff = data_termino - data_inicio;
  const diasFaltando = Math.floor(diff / (60 * 60 * 24)); // agora correto
  req.session.fim = diasFaltando;
  const query1 = `SELECT * FROM Campanhas WHERE titulo = ?`;
  const query2 = `
    INSERT INTO Campanhas 
    (titulo, conteudo, ativo, data_inicio, data_termino, diasFaltando)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const ativo = 1;

  db.get(query1, [titulo], (err, row) => {
    if (err) throw err;

    if (row) {
      console.log(`Campanha ${titulo} já cadastrada`);
      return res.redirect("/usuario-ja-cadastrado");
    }

    db.run(query2, [titulo, conteudo, ativo, data_inicio, data_termino, diasFaltando], function (err) {
      if (err) throw err;

      console.log(`Campanha ${titulo} cadastrada com sucesso`);
      res.redirect("/Campanhas");
    });
  });
});

app.get("/campanhas/ativas/:id", (req, res) => {
  let idCampanha = req.params.id;

  let sql = "SELECT * FROM campanhas WHERE id_Campanha = ?";
  db.get(sql, [idCampanha], (erro, linha) => {
    if (erro) {
      console.log("Erro ao buscar campanha:", erro);
      return res.send("Erro no servidor");
    }

    if (!linha) {
      return res.send("Campanha não encontrada");
    }

    // Cálculo dos dias faltando
    let agora = Math.floor(Date.now() / 1000);
    let diferenca = linha.data_termino - agora;
    let dias = Math.ceil(diferenca / 86400);

    linha.diasFaltando = dias;

    res.render("pages/campanha_detalhe", { campanha: linha, titulo: "Editor de Campanhas", req: req });
  });
});

app.post("/editar_campanha", (req, res) => {

  let id = req.body.id_Campanha;
  let titulo = req.body.titulo;
  let conteudo = req.body.conteudo;

  let inicioTexto = req.body.inicio;
  let terminoTexto = req.body.termino;

  let inicioData = new Date(inicioTexto + " 00:00:00");
  let terminoData = new Date(terminoTexto + " 00:00:00");

  let inicioSegundos = Math.floor(inicioData.getTime() / 1000);
  let terminoSegundos = Math.floor(terminoData.getTime() / 1000);

  let ativo = req.body.ativo;

  let sql = "UPDATE campanhas SET titulo=?, conteudo=?, data_inicio=?, diasFaltando=?, ativo=? WHERE id_Campanha=?";

  db.run(sql, [titulo, conteudo, inicioSegundos, terminoSegundos, ativo, id], (erro) => {
    if (erro) {
      return res.send("Erro ao editar campanha.");
    }

    res.redirect("/campanhas_ativas");
  });
});

app.get("/editar_campanha/:id", (req, res) => {

  let id_Campanha = req.params.id;
  let sql = "SELECT * FROM Campanhas WHERE id_Campanha = ?";

  db.get(sql, [id_Campanha], (erro, campanha) => {
    if (erro || !campanha) {
      return res.send("Campanha não encontrada.");
    }

    let dataIni = new Date(campanha.data_inicio * 1000);
    let ano1 = dataIni.getFullYear();
    let mes1 = dataIni.getMonth() + 1;
    let dia1 = dataIni.getDate();
    if (mes1 < 10) mes1 = "0" + mes1;
    if (dia1 < 10) dia1 = "0" + dia1;
    let inicioFmt = ano1 + "-" + mes1 + "-" + dia1;

    let dataFim = new Date(campanha.data_termino * 1000);
    let ano2 = dataFim.getFullYear();
    let mes2 = dataFim.getMonth() + 1;
    let dia2 = dataFim.getDate();
    if (mes2 < 10) mes2 = "0" + mes2;
    if (dia2 < 10) dia2 = "0" + dia2;
    let terminoFmt = ano2 + "-" + mes2 + "-" + dia2;

    res.render("pages/editar_campanha", {
      campanha: campanha,
      inicioFmt: inicioFmt,
      terminoFmt: terminoFmt,
      titulo: "Editar Campanhas",
      req:req
    });
  });
});



app.post("/editar_campanha/:id", (req, res) => {

  let id_Campanha = req.params.id;
  let titulo = req.body.titulo;
  let conteudo = req.body.conteudo;

  let inicioTexto = req.body.data_inicio;
  let terminoTexto = req.body.data_termino;

  // Transformando texto de data em partes
  let partesIni = inicioTexto.split("-");
  let partesFim = terminoTexto.split("-");

  let dataIni = new Date(partesIni[0], partesIni[1] - 1, partesIni[2], 0, 0, 0);
  let dataFim = new Date(partesFim[0], partesFim[1] - 1, partesFim[2], 0, 0, 0);

  let inicioSeg = Math.floor(dataIni.getTime() / 1000);
  let fimSeg = Math.floor(dataFim.getTime() / 1000);

  // VALIDAÇÃO: início > término
  if (inicioSeg > fimSeg) {
    return res.send("Erro: a data de início não pode ser maior que a data de término.");
  }

  let sql = `
    UPDATE Campanhas 
    SET titulo = ?, conteudo = ?, data_inicio = ?, data_termino = ?
    WHERE id_Campanha = ?
  `;

  db.run(sql, [titulo, conteudo, inicioSeg, fimSeg, id_Campanha], (erro) => {
    if (erro) {
      return res.send("Erro ao editar campanha.");
    }

    res.redirect("/campanhas_ativas");
  });
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
  if (req.session.loggedin) {
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