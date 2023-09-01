const TelegramBot = require('node-telegram-bot-api')
const fetch = require('cross-fetch')
const express = require('express')
require('dotenv').config({ path: '.env.local' })
const { mainMenu } = require('./keyboard')

const {
    BOT_TOKEN,
    PORT = 3000
} = process.env

const bot = new TelegramBot(BOT_TOKEN, {
    polling: true,
    filepath: false
})
console.log(BOT_TOKEN)

bot.getMe().then((me) => {
    console.log('ready!')
    console.log(`Bot username: ${me.username}`)
})

const menu_text = `Welcome to the official Alls.to Telegram! If you have any questions or inquiries, please select the appropriate option below.\n\nSimplify Your Stablecoin Life in Web3:  https://alls.to\n
        \nIf you need further assistance, please send admin a private message: 
        \n👨‍💼 Moderator: @MrFish\n🤝 Cooperation: @KaceyK0 
        `

const app = express()
app.listen(PORT, async () => {

    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id
        const userName = msg.from.username
        bot.sendMessage(chatId, menu_text, mainMenu)
    })


    bot.onText(/\/menu/, async (msg) => {
        const chatId = msg.chat.id
        const userName = msg.from.username
        const userId = msg.from.id
        console.log(userId)
        bot.sendMessage(chatId, menu_text, mainMenu)
    })

    bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id
        const userId = callbackQuery.from.id
        const data = callbackQuery.data

        if (data === 'coop') {
            bot.sendMessage(chatId, 'To implement an enterprise-level fiat and stablecoin payment solution on web3, please contact @KaceyK0 for further collaboration.')
        }

        console.log(`${userId}: ${data}`)
    })

    bot.on('message', (msg) => {
        if (!msg.text || !msg.text.startsWith('/start') && !msg.text.startsWith('/menu')) {
            bot.sendMessage(msg.chat.id, 'Please click a button above to start.')
        }
    })
})
