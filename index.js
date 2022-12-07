const TelegramApi = require('node-telegram-bot-api')
const {gameOption, againOption} = require('./options')
const token = '5829798396:AAFRZHbDAXW3smlIge_VLX2m_DNWJXHxMJE'
const sequelize = require('./db')
const UserModels = require('./models')

const bot = new TelegramApi(token, {polling: true})

const chats = {}



const startGame = async (chatId) => {
  await bot.sendMessage(chatId, 'Я загадывать сейчас число от 0 до 9, а ты отгадать его')
  const randomNumber = Math.floor(Math.random() * 10)
  chats[chatId] = randomNumber;
  console.log(chats[chatId])
  await bot.sendMessage(chatId, 'Отгадывай', gameOption)
}

  const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log('Подключение к БД сломалось, так как:', e)
    }

    bot.setMyCommands([
      {command: '/start', description: "Начальное приветствие"},
      {command: '/info', description: "Получить инфу о пользователе"},
      {command: '/game', description: "Игра угадай число"}
    ])
    
    bot.on('message', async msg => {
      const text = msg.text;
      const chatId = msg.chat.id;

      try {
        if (text === '/start') {
          await UserModels.create(chatId)
          await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/80a/5c9/80a5c9f6-a40e-47c6-acc1-44f43acc0862/2.webp')
          return bot.sendMessage(chatId, "welcome in telegram bot")
        }
        if (text === '/info') {
          const user = await UserModels.findOne({chatId})
          return bot.sendMessage(chatId, `Тебя зовут пользователь ${msg.from.first_name} ${msg.from.last_name},
          в игре у тебя правильных ответов ${user.right},
          неправильных ${user.wrong}`);
        }
        if (text === '/game') {
          return startGame(chatId)
        }
        return bot.sendMessage(chatId, 'Я тебя не понимаю, напиши еще раз') 
      } catch (e) {
          return bot.sendMessage(chatId, "Произошла какая-то ошибка")
      }
      })

      bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data === '/again') {
          return startGame(chatId)
        }
        
        const user = await UserModels.findOne({chatId})

        if (data == chats[chatId]) {
          user.right += 1;
          await bot.sendMessage(chatId, `Моя твоя поздравляй, ты отгадать цифра ${chats[chatId]}`, againOption)
        } else {
          user.wrong += 1;
          await bot.sendMessage(chatId, `Моя твоя соболезновать, я загадывай цифра ${chats[chatId]}`, againOption)
        }
        await user.save()
      })
  }

start()