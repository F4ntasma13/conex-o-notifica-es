const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

let clients = new Set();

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

// 🚀 Mantendo o servidor WebSocket ativo no Render
setInterval(() => {
    console.log("⏳ Enviando Keep-Alive para evitar hibernação...");
    fetch("https://conex-o-notifica-es.onrender.com")
        .then(() => console.log("✅ Keep-Alive enviado!"))
        .catch(() => console.warn("⚠️ Erro ao enviar Keep-Alive."));
}, 60000); // A cada 1 minuto

console.log("🚀 Servidor WebSocket rodando na porta 8080");





