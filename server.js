const express = require('express');
const { Client } = require('ssh2');
const { exec } = require('child_process');  // Importa o módulo 'exec' para executar comandos do sistema

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

let currentConnection = {};  // Para armazenar a conexão atual (IP e porta)

app.post('/connect', (req, res) => {
    const { host, port, username, password } = req.body;

    // Verificar se todos os campos foram fornecidos corretamente
    if (!host || !port || !username || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
    }

    const conn = new Client();
    conn.on('ready', () => {
        currentConnection = { host, port };  // Armazena o host e a porta da conexão
        res.json({ message: 'Conectado com sucesso!', host, port });
        conn.end();
    }).on('error', (err) => {
        res.status(500).json({ error: 'Erro na conexão SSH: ' + err.message });
    }).connect({
        host,
        port: parseInt(port, 10),
        username,
        password
    });
});

// Endpoint para rodar o comando de ping
app.post('/ping', (req, res) => {
    const { host } = currentConnection;

    if (!host) {
        return res.status(400).json({ error: 'Nenhuma conexão ativa!' });
    }

    // Rodando o comando ping no sistema
    exec(`ping ${host}`, (err, stdout, stderr) => {
        if (err) {
            return res.status(500).json({ error: `Erro ao rodar ping: ${err.message}` });
        }
        if (stderr) {
            return res.status(500).json({ error: `Erro de stderr: ${stderr}` });
        }

        res.json({ pingResult: stdout });
    });
});

// Servindo o arquivo de ping como .txt
app.get('/download-ping', (req, res) => {
    const { host } = currentConnection;
    if (!host) {
        return res.status(400).json({ error: 'Nenhuma conexão ativa!' });
    }

    exec(`ping ${host}`, (err, stdout, stderr) => {
        if (err) {
            return res.status(500).json({ error: `Erro ao rodar ping: ${err.message}` });
        }
        if (stderr) {
            return res.status(500).json({ error: `Erro de stderr: ${stderr}` });
        }

        // Gerando o arquivo .txt com os resultados do ping
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=ping-result.txt');
        res.send(stdout);
    });
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}!`));
