const mainMenu = {
    reply_markup: {
        inline_keyboard: [
            [{ text: '👨‍💼 Get Help', url: 'https://discord.com/invite/5nEmUemqKC' }],
            [
                { text: '▶️ Create My Payment Link', url: 'https://alls.to' },
                { text: '📋 Docs', url: 'https://docs.alls.to' }
            ],
            [{ text: '🤝 Integrate with AllsTo Enterprise', callback_data: 'coop' }],
        ]
    }
}


module.exports = {
    mainMenu,
}