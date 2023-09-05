const TelegramBot = require('node-telegram-bot-api')
const fetch = require('cross-fetch')
const express = require('express')
require('dotenv').config({ path: '.env.local' })
const { getWallet, getPrivateKey } = require('./Wallet')
const { mainMenu, from, to_arb, to_bnb, to_eth, confirm } = require('./keyboard')
const { initiateSwap, getPrice } = require('./mesonAPI')

const {
    BOT_TOKEN,
    PORT = 3000
} = process.env

let walletAddress
const selections = {}
const map = {
    'eth': 'Ethereum',
    'bnb': 'BNB Chain',
    'arb': 'Arbitrum'
}


const bot = new TelegramBot(BOT_TOKEN, {
    polling: true,
    filepath: false
})
console.log(BOT_TOKEN)

bot.getMe().then((me) => {
    console.log('ready!')
    console.log(`Bot username: ${me.username}`)
})

const app = express()
app.listen(PORT, async () => {

    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id
        const userId = msg.from.id
        walletAddress = await getWallet(userId)
        if (!selections[userId]) {
            selections[userId] = []
        }
        selections[userId][4] = walletAddress
        const menu_text = `Welcome to the official Alls.to Telegram! If you have any questions or inquiries, please select the appropriate option below.
        \nComplete easier cross-chain collection and payment through:  https://alls.to \n——————  📣 <b>Your Wallet</b> ——————
        \nFor your convenience, we have automatically generated a wallet address that belongs only to you:\n🔑<code>${walletAddress}</code>🔑\n1. Click 🔁 Swap to start a transaction\n2. Click 🔑 Show Private Key to display the private key of this address.\n
        \n——————  ℹ️ <b>Get Help</b> ——————\nIf you need further assistance, please send admin a private message: 
        \n👨‍💼 Moderator: @MrFish\n🤝 Cooperation: @KaceyK0
        \nIf you require assistance with your link or transactions regarding Alls.to, please follow these steps for support:\n1. Join the Alls.to Discord server using the following link: https://discord.gg/alls.to\n2. Click the 'Get Help' button below.
        `
        bot.sendMessage(chatId, menu_text, mainMenu)
    })


    bot.onText(/\/menu/, async (msg) => {
        const chatId = msg.chat.id
        const userId = msg.from.id
        console.log(userId)
        walletAddress = await getWallet(userId)
        if (!selections[userId]) {
            selections[userId] = []
        }
        selections[userId][4] = walletAddress
        const menu_text = `Welcome to the official Alls.to Telegram! If you have any questions or inquiries, please select the appropriate option below.
        \nComplete easier cross-chain collection and payment through:  https://alls.to \n——————  📣 <b>Your Wallet</b> ——————
        \nFor your convenience, we have automatically generated a wallet address that belongs only to you:\n🔑<code>${walletAddress}</code>🔑\n1. Click 🔁 Swap to start a transaction\n2. Click 🔑 Show Private Key to display the private key of this address.\n
        \n——————  ℹ️ <b>Get Help</b> ——————\nIf you need further assistance, please send admin a private message: 
        \n👨‍💼 Moderator: @MrFish\n🤝 Cooperation: @KaceyK0
        \nIf you require assistance with your link or transactions regarding Alls.to, please follow these steps for support:\n1. Join the Alls.to Discord server using the following link: https://discord.gg/alls.to\n2. Click the 'Get Help' button below.
        `
        bot.sendMessage(chatId, menu_text, mainMenu)
    })

    bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message.chat.id
        const userId = callbackQuery.from.id
        const messageId = callbackQuery.message.message_id
        const data = callbackQuery.data

        if (data === 'coop') {
            bot.sendMessage(chatId, 'ALLsTo currently supports fast integration with more than 20 chains, including Ethereum, BNB Chain, Polygon PoS, Arbitrum, Optimism, Avalanche, Tron, Fantom, Aurora, Conflux eSpace, Moonriver, Moonbeam, Cronos, EOS EVM, zkSync Era, Polygon zkEVM, Linea, Base, Aptos, and Sui.\nTo implement an enterprise-level fiat and stablecoin payment solution on web3, please contact @KaceyK0 for further collaboration.')
        }
        else if (data === 'swap') {
            bot.sendMessage(chatId, "Please select the origin network and token:", from)
        }
        else if (data === 'privateKey') {
            const privateKey = await getPrivateKey(userId)
            bot.sendMessage(chatId, `⛔️Warning: Never disclose this key. Anyone with your private keys can steal any assets held in your account.\n\n${privateKey}`)
        }
        else if (data.startsWith('from')) {
            if (!selections[userId]) {
                selections[userId] = []
            }
            selections[userId][0] = data.split('-')[1]
            selections[userId][1] = data.split('-')[2]
            let to
            if (selections[userId][0] === 'eth') to = to_eth
            else if (selections[userId][0] === 'bnb') to = to_bnb
            else if (selections[userId][0] === 'arb') to = to_arb

            if (!selections[userId][4]) selections[userId][4] = await getWallet(userId)
            bot.sendMessage(chatId, `ℹ️The recipient address is ${selections[userId][4]}.\nPlease select the destination network and token:`, to)
        }
        else if (data.startsWith('to')) {
            if (!selections[userId]) {
                selections[userId] = []
            }
            selections[userId][2] = data.split('-')[1]
            selections[userId][3] = data.split('-')[2]
            console.log("from: " + selections[userId][2] + "-" + selections[userId][3])
            bot.sendMessage(chatId, 'Please enter swap amount:', {
                reply_markup: {
                    force_reply: true,
                }
            })
        }
        else if (data === 'continue') {
            bot.sendMessage(chatId, 'Processing...')
            try {
                const privateKey = await getPrivateKey(userId)
                const swapResp = await initiateSwap(selections[userId], privateKey)
                console.log(swapResp)
                bot.sendMessage(chatId, `Swap Successfully. Click the button below to check details.\nSwap ID: ${swapResp.result.swapId}`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Check Status', url: `https://explorer.meson.fi/swap/${swapResp.result.swapId}` }]
                        ]
                    }
                })
            } catch (e) {
                bot.sendMessage(chatId, `${e}`)
                if (e.message === "amount-over-balance") {
                    bot.sendMessage(chatId, `⚠️ Please make sure that there is enough balance in your wallet address and that it is approved on MesonFi.\n\nFollow these steps to complete the approval operation on MesonFi:\n1. Connect your wallet address to meson.fi.\n2. Enter the corresponding swap amount and click the Swap button.\n3. Click the Approve button on the Approval pop-up window.
                    `, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Approve Now', url: 'https://meson.fi' }]
                            ]
                        }
                    })
                }
                else if (e.message === "insufficient-allowance") {
                    bot.sendMessage(chatId, `⚠️ Please follow these steps to complete the approval operation on MesonFi before swapping:\n1. Connect your wallet address to meson.fi.\n2. Enter the corresponding swap amount and click the Swap button.\n3. Click the Approve button on the Approval pop-up window.
                    `, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Approve Now', url: 'https://meson.fi' }]
                            ]
                        }
                    })
                }
            }
        }
        else if (data === 'close') {
            bot.deleteMessage(chatId, messageId)
        }

        console.log(`${userId}: ${data}`)
    })

    bot.on('message', (msg) => {
        if (!msg.text || !msg.text.startsWith('/start') && !msg.text.startsWith('/menu') && !msg.reply_to_message) {
            bot.sendMessage(msg.chat.id, 'Please click a button above to start.')
        }
    })

    bot.on('message', async (msg) => {
        if (msg.reply_to_message && msg.reply_to_message.text === "Please enter swap amount:") {
            const chatId = msg.chat.id
            const userId = msg.from.id
            if (!msg.text) {
                bot.sendMessage(chatId, 'Please enter text message')
                return
            }
            const amount = msg.text
            if (!selections[userId]) {
                selections[userId] = []
            }
            selections[userId][5] = amount

            if (!selections[userId][4]) selections[userId][4] = await getWallet(userId)
            bot.sendMessage(chatId, `Please confirm the swap details:\nFrom/To: ${map[selections[userId][0]]} (${selections[userId][1].toUpperCase()}) → ${map[selections[userId][2]]} (${selections[userId][3].toUpperCase()})\nAmount: ${selections[userId][5]} ${selections[userId][1].toUpperCase()}\nSender: ${selections[userId][4]}\nRecipient: ${selections[userId][4]}`)
            const fee = await getPrice(selections[userId])
            if (!fee.error) {
                bot.sendMessage(chatId, `Total Fee: ${fee.result.totalFee} ${selections[userId][1].toUpperCase()}\nService Fee: ${fee.result.serviceFee} ${selections[userId][1].toUpperCase()}\nLP Fee: ${fee.result.lpFee} ${selections[userId][1].toUpperCase()}\n\nReceive: ${selections[userId][5] - fee.result.totalFee} ${selections[userId][1].toUpperCase()}`, confirm)
            }
            else {
                if (fee.error.message === "invalid-amount") {
                    bot.sendMessage(chatId, "⚠️Invalid amount. Please enter a number.")
                    return
                }
                bot.sendMessage(chatId, `Error: ${fee.error.message}`)
            }
        }
    })

})
