const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let clients = new Set();

wss.on('connection', (ws) => {
    console.log('✅ Novo cliente conectado!');
    clients.add(ws);

    ws.on('message', (message) => {
        console.log('📩 Mensagem recebida:', message);

        try {
            const data = JSON.parse(message);

            if (data.type === "lead_registration" && data.leadData) {
                console.log('🎯 Lead registrado:', data);

                const nome = data.leadData.nome || "Desconhecido";
                const email = data.leadData.email || "Não informado";
                const telefone = data.leadData.telefone || "Não informado";

                const notification = {
                    type: "notification",
                    content: `Novo lead cadastrado: ${nome}`,
                    leadData: { nome, email, telefone }
                };

                console.log('📢 Notificação gerada:', notification);

                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(notification));
                    }
                });

                console.log('✅ Notificação enviada para todos os clientes.');
            } else {
                console.warn("⚠️ Dados do lead ausentes ou formato inválido:", data);
            }
        } catch (error) {
            console.error("❌ Erro ao processar mensagem:", error);
        }
    });

    ws.on('close', () => {
        console.log('❌ Cliente desconectado');
        clients.delete(ws);
    });
});

console.log('🚀 Servidor WebSocket rodando na porta 8080');



