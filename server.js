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

            // Criar um objeto padrão se leadData estiver ausente
            const leadData = data.leadData || {};
            const nome = leadData.nome?.trim() || "Desconhecido";
            const email = leadData.email?.trim() || "Não informado";
            const telefone = leadData.telefone?.trim() || "Não informado";

            if (data.type === "lead_registration" || data.type === "notification") {
                console.log('🎯 Lead registrado:', data);

                // Criar notificação
                const notification = {
                    type: "notification",
                    content: `Novo Lead cadastrado: ${nome}`,
                    leadData: { nome, email, telefone }
                };

                console.log('📢 Notificação gerada:', notification);

                // Enviar para todos os clientes conectados
                clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(notification));
                    }
                });

                console.log('✅ Notificação enviada para todos os clientes.');
            } else {
                console.warn("⚠️ Tipo de mensagem desconhecido:", data);
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







