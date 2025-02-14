const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let notificationClient = null;

wss.on('connection', (ws) => {
    console.log('Novo cliente conectado!');

    ws.on('message', (message) => {
        console.log('Mensagem recebida:', message);

        try {
            const data = JSON.parse(message);

            if (data.type === "register_notification_client") {
                notificationClient = ws;
                console.log('Página de notificações registrada.');
            }

            if (data.type === "lead_registration") {
                console.log('Lead cadastrado.');
                if (notificationClient && notificationClient.readyState === WebSocket.OPEN) {
                    notificationClient.send(
                        JSON.stringify({
                            type: "notification",
                            content: `Novo lead cadastrado: ${data.nome}`
                        })
                    );
                    console.log('✅ Notificação enviada para a página de notificações.');
                } else {
                    console.log('⚠️ Nenhuma página de notificações registrada.');
                }
            }
        } catch (error) {
            console.error("Erro ao processar mensagem:", error);
        }
    });

    ws.on('close', () => {
        console.log('Cliente desconectado');
        if (ws === notificationClient) {
            notificationClient = null;
            console.log('Página de notificações foi fechada.');
        }
    });
});

console.log('Servidor WebSocket rodando na porta 8080');
