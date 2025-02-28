const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = new Set();

app.get("/", (req, res) => {
    res.send("Servidor WebSocket rodando com Express!");
});

wss.on("connection", (ws) => {
    console.log("✅ Novo cliente conectado!");
    clients.add(ws);

    ws.on("message", (message) => {
        console.log("📩 Mensagem recebida:", message);

        try {
            const data = JSON.parse(message);

            if ((data.type === "lead_registration" || data.type === "notification") && data.leadData) {
                console.log("🎯 Lead registrado:", data);

                const nome = data.leadData.nome?.trim() || "Desconhecido";
                const email = data.leadData.email?.trim() || "Não informado";
                const fone_celular = data.leadData.fone_celular?.trim() || "Não informado";

                const notification = {
                    type: "notification",
                    content: `Novo Lead cadastrado: ${nome}`,
                    leadData: { nome, email, fone_celular }
                };

                console.log("📢 Notificação gerada:", notification);

                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(notification));
                    }
                });

                console.log("✅ Notificação enviada para todos os clientes.");
            } else {
                console.warn("⚠️ Dados do lead ausentes ou formato inválido:", data);
            }
        } catch (error) {
            console.error("❌ Erro ao processar mensagem:", error);
        }
    });

    ws.on("close", () => {
        console.log("❌ Cliente desconectado");
        clients.delete(ws);
    });
});

const PORT = 8080;
server.listen(PORT, "0.0.0.0", () => {
    console.log("Servidor Express rodando em:");
    console.log(`ws://localhost:${PORT}`);
    console.log(`ws://192.168.1.2:${PORT} (acesso na rede local)`);
});