const mainMenu = {
    reply_markup: {
        inline_keyboard: [
            [{ text: '👨‍💼 Get Help', url: 'https://discord.com/invite/5nEmUemqKC' }],
            [
                { text: '▶️ Create my payment link', url: 'https://alls.to' },
                { text: '📋 Docs', url: 'https://docs.alls.to' }
            ],
            [{ text: '🤝 Integrate with allsto enterprise', callback_data: 'coop' }],
        ]
    }
}


module.exports = {
    mainMenu,
}