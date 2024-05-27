console.log('Olá, maravilhosa')


/** ESTRUTURA DE DADOS
 * {
 * nome: ''
 * autor: ''
 * genero: ''
 * anoPublicacao: ''
 * personagens: [personagem1, 2, 3, 4]
 * }
 
 */

import http from 'http'
import fs from 'fs'

const PORT = 3333

const server = http.createServer((request, response) => {
    const { method, url } = request

    if (method === 'GET' && url === '/livros') {
        fs.readFile('livros.json', 'utf-8', (err, data) => {
            if (err) {
                response.writeHead(500, { "Content-Type": "application/json" })
                response.end(JSON.stringify({ message: "Não foi possível ler o arquivo" }))
                return
            }
            response.writeHead(200, { "Content-Type": "application/json" })
            response.end(data)
        })
    } else if (method === "POST" && url === "/livros") {
        let body = "";
        request.on("data", (chunk) => {
            body += chunk
        })
        request.on('end', () => {
            const novoLivro = JSON.parse(body)
            fs.readFile("livros.json", "utf8", (err, data) => {
                if (err) {
                    response.writeHead(500, { "Content-Type": "application/json" });
                    response.end(JSON.stringify({ message: "Não foi possível acessar os dados" }))
                    return
                }
                const livros = JSON.parse(data)
                novoLivro.id = livros.length + 1
                livros.push(novoLivro)

                fs.writeFile('livros.json', JSON.stringify(livros, null, 2), (err) => {
                    // null sig q nn vai substituir
                    // 2 formatacao, para um ficar abaixo do outro
                    if (err) {
                        response.writeHead(500, { 'Content-Type': 'application/json' })
                        response.end(JSON.stringify({ message: 'Erro ao salvar o arquivo' }))
                        return
                    }
                    response.writeHead(201, { 'Content-Type': 'application/json' })
                    response.end(JSON.stringify(novoLivro))
                })
                console.log(livros)
                return response.end()
            })
        })
    } else if(method === "PUT" && url.startsWith("/livros/")){
        const id = parseInt(url.split("/")[2]);

        let body = "";
        request.on("data", (chunk)=>{
            body += chunk;
        });
        request.on('end', ()=>{
            const livroAtualizado = JSON.parse(body);
            fs.readFile("livros.json", "utf8", (err, data)=>{
                if(err){
                    response.writeHead(500, { 'Content-Type': 'application/json' })
                    response.end(JSON.stringify({ message: 'Não foi possivel ler o arquivo' })
                    );
                    return;
                }
                const livros = JSON.parse(data)

                const indexLivro = livros.indexLivro((livro)=>livro.id === id)
                if(indexLivro === -1){
                    response.writeHead(400, {'Content-Type': 'application/json'})
                    response.end(JSON.stringify({message: 'Livro não encontrado'}))
                    return
                }
                livros[indexLivro] = {...livros[indexLivro], ...livroAtualizado}

                fs.writeFile('livros.json', JSON.stringify(livros, null, 2), (err)=>{
                    if(err){
                        response.writeHead(500, { 'Content-Type': 'application/json' })
                        response.end(JSON.stringify({ message: 'Arquivo não encontrado' }))
                        return
                    }
                    response.writeHead(200, { 'Content-Type': 'application/json' })
                    response.end(JSON.stringify(livroAtualizado))
                })
            })
        })
        // RECEBER UM VALOR NA URL /livros/{id}
    }else if(method === 'DELETE' && url.startsWith('/livros')){
        const id = parseInt(url.split('/')[2])
        fs.readFile('livros.json', 'utf-8', (err, data)=>{
            if(err){
                response.writeHead(500, {'Content-Type': 'application/json'})
                response.end(JSON.stringify({message: 'Não foi possivel acessar o arquivo'}))
                return
            }
            const livros = JSON.parse(data)
            const indexLivros = livros.findIndex((livro) => livro.id === id)
             // V - indice do elemento | F - resultado -1
             //console.log(indexLivros)
              if(indexLivros === -1){
                 response.writeHead(500, {'Content-Type': 'application/json'})
                 response.end(JSON.stringify({message: 'Livro não encontrado'}))
                 return
              }
              // connsole.log(livros)
              livros.splice(indexLivro, 1)
              // console.log(livros)
              // pode passar alguns paremetros, 
              // 1 = posicao que vai acontecer uma acao
              fs.watchFile('livros.json', JSON.stringify(livros, null, 2), (err)=>{
                if(err){
                    response.writeHead(500, {"Content-Type": "application/json"});
                    response.end(JSON.stringify({message: "Não é possivel escrever no arquivo"}))
                        return
                }
                response.writeHead(200, ({'Content-Type': 'application/json'}))
                response.end(JSON.stringify({message: 'Livro excluido'}))
              })
        })
    }else if (method === 'GET' && url.startsWith('/livros/')) {
        const id = parseInt(url.split('/')[2])
        console.log(id)
        fs.readFile('livros.json', 'utf8', (err, data) => {
            if (err) {
                response.writeHead(500, {'Content-Type': 'application/json'})
                response.end(JSON.stringify({ message: "Erro ao pesquisar o arquivo" }))
                return
            }
            const livros = JSON.parse(data)
            const encontrarLivros = livros.find((livro) => livro.id === id) // traz verdadeiro ou falso
            console.log(encontrarLivros)
            if (!encontrarLivros) {
                response.writeHead(404, { 'Content-Type': 'application/json' })
                response.end(JSON.stringify({ message: "Livro não encontrado"}))
                return
            } 
            response.writeHead(200,{'Content-Type': 'application/json'})
            response.end(JSON.stringify(encontrarLivros))
        })
    } else {
        response.writeHead(404, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "Página não encontrada" }))
    }
})


server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
})
