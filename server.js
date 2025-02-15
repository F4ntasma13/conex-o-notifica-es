const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let clients = new Set(); 

wss.on('connection', (ws) => {
    console.log('Novo cliente conectado!');
    clients.add(ws);

    ws.on('message', (message) => {
        console.log('Mensagem recebida:', message);

        try {
            const data = JSON.parse(message);

            if (data.type === "lead_registration") {
                console.log('Lead cadastrado.');

                const notificationData = {
                    type: "notification",
                    content: `Novo lead cadastrado: ${data.nome}`,
                    leadData: {
                        nome: data.nome || "Desconhecido",
                        email: data.email || "Não informado",
                        telefone: data.telefone || "Não informado"
                    }
                };

                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(notificationData));
                    }
                });

                console.log('✅ Notificação enviada para todos os clientes.', notificationData);
            }
        } catch (error) {
            console.error("Erro ao processar mensagem:", error);
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado');
        clients.delete(ws);
    });
});

console.log('Servidor WebSocket rodando na porta 8080');


