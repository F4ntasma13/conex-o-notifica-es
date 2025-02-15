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

            // Garantir que a mensagem seja do tipo correto
            if (!data || typeof data !== 'object' || data.type !== "lead_registration") {
                console.warn("⚠️ Mensagem ignorada. Tipo inválido ou dados corrompidos:", data);
                return;
            }

            console.log("🎯 Lead registrado:", JSON.stringify(data, null, 2));

            // Verifica se leadData está presente
            const leadData = data.leadData ?? {};

            // Garantir que os dados tenham valores válidos
            const nome = leadData.nome?.trim() || "Desconhecido";
            const email = leadData.email?.trim() || "Não informado";
            const telefone = leadData.telefone?.trim() || "Não informado";

            // Criando uma única notificação
            const notification = {
                type: "notification",
                content: `Novo lead cadastrado: ${nome}`,
                leadData: { nome, email, telefone }
            };

            console.log('📢 Notificação gerada:', JSON.stringify(notification, null, 2));

            // Enviar notificação para todos os clientes conectados **uma única vez**
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(notification));
                }
            });

            console.log('✅ Notificação enviada para todos os clientes conectados.');
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






