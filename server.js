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

            if (!data || typeof data !== 'object') {
                console.warn("⚠️ Dados recebidos inválidos:", data);
                return;
            }

            if (data.type === "lead_registration") {
                // Verifica se leadData existe
                const leadData = data.leadData ?? {};
                
                const nome = leadData.nome?.trim() || "Desconhecido";
                const email = leadData.email?.trim() || "Não informado";
                const telefone = leadData.telefone?.trim() || "Não informado";

                console.log("🎯 Lead registrado:", leadData);

                // Criando uma única notificação
                const notification = JSON.stringify({
                    type: "notification",
                    content: `Novo lead cadastrado: ${nome}`,
                    leadData: { nome, email, telefone }
                });

                console.log('📢 Notificação gerada:', notification);

                // Enviando a notificação para todos os clientes conectados
                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(notification);
                    }
                });

                console.log('✅ Notificação enviada para todos os clientes.');
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





