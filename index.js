import express , {json} from "express";
import { Db, MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

//como usar arquivo .env: por volta da minutagem 1h20min da aula do dia 27/04
/*Pacote: dotenv -> npm i dotenv -> importar o pacote -> dotenv.config() carrega as configurações dentro da aplicação
-> inclui o arquivo .env no gitignore
*/

const app = express();
app.use(cors());
app.use(json());

const mongoClient = new MongoClient(process.env.MONGO_URL);
let bancoDados;

mongoClient.connect().then(() => {
    bancoDados = mongoClient.db(process.env.BANCO);
});



app.post("/cadastrar", (req, res) => {
    const {nome: usuario, email, senha, confirmacao} = req.body;
        
    if((!(usuario) || !(email) || !(senha) || !(confirmacao))){
        
        res.status(206).send("Faltam dados");
    }else if (senha !== confirmacao){
        
        res.status(203).send("Senhas conflitantes");
    }else{
        bancoDados.collection("usuarios").find({ email: email }).toArray().then(resposta => {
            console.log(resposta)
            if(resposta === []){
                bancoDados.collection("usuarios").insertOne(
                    {nome: usuario,
                    email: email,
                    senha: senha,
                    atividades: []}
                );
                res.status(200).send("Usuário cadastrado com sucesso!");

            }else{
                res.status(403).send("Esse usuário já está cadastrado");
            }
        });
        
        
    }
})

app.post("/logar", (req, res) => {
    const {email, senha} = req.body;
    
    if( !(email) || !(senha) ){
        
        res.status(206).send("Faltam dados");
    }//else if (senha !== confirmacao){ //caso da senha estar errado ou e-mail não ter sido encontrado
        
    //     res.status(401).send("Email ou senha incorretos");
    //}
    else{
        let requisicao = bancoDados.collection("usuarios").findOne({ email: email , senha: senha});
        requisicao.then(resposta => {
            if(resposta && (resposta.senha === senha)){
                res.status(200).send("Usuário logado com sucesso!");
            }else{
                res.status(401).send("email ou senha incorretos");
            }
        });
    }
})

app.listen(process.env.PORTA);