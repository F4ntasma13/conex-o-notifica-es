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

            const nome = data.leadData?.nome || "Desconhecido";
            const email = data.leadData?.email || "Não informado";
            const telefone = data.leadData?.fone_celular || "Não informado";
            
            if (data.type === "lead_registration") {
                // Criando notificação única para todos os clientes conectados
                const notification = {
                    type: "notification",
                    content: `Novo lead cadastrado: ${nome}`,
                    leadData: {email, telefone}
                };

                console.log('📢 Notificação gerada:', notification);

                // Enviar a notificação para todos os clientes conectados
                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(notification));
                    }
                });

                console.log('✅ Notificação enviada para todos os clientes conectados.');
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





