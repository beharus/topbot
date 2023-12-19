const TelegramBot = require('node-telegram-bot-api');
const { MongoClient } = require('mongodb');
require('dotenv').config();


const TOKEN = process.env.TOKEN;
const MONGODB_URL = process.env.MONGODB_URL;
const client = new MongoClient(MONGODB_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const bot = new TelegramBot(TOKEN, { polling: true });
let initMovie = {
  url: "",
  imgPreview: "",
  title: "",
  lang: "",
  code: "",
  year: "",
  genre: "",
  country: ""
}
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');

    bot.onText(/\/start/, (msg) => {
      bot.sendMessage(msg.chat.id, `<b>👋Hello, ${msg.from.first_name}!\n\n✍️Send me the code of the movie you're searching for. For example: 2021, 1221\n\n<a href="https://www.youtube.com/shorts/6P9LMaQtNHw">Telegram</a> | <a href="https://www.youtube.com/shorts/6P9LMaQtNHw">Youtube</a></b>`, { parse_mode: 'HTML', disable_web_page_preview: true });
    });

    bot.onText(/\/aziza/, async (msg) => {
      try {
        await bot.sendMessage(msg.chat.id, 'Hello admin! Could we start?', {
          reply_markup: {
            keyboard: [
              ["📽 add new movie", "🔑 log out"]
            ],
            resize_keyboard: true,
          }
        });

      } catch (e) {
        console.error('Error in MongoDB operations:', e);
      }
    });
    bot.on('message', async (msg) => {
      let chatId = msg.chat.id
      let movies = client.db('telegrambot').collection('movies')
      console.log(msg);
      switch (msg.text) {
        case '📽 add new movie':
          bot.sendMessage(chatId, '*Enter the movie URL:*', {
            parse_mode: 'Markdown',
            reply_markup: {
              remove_keyboard: true
            }
          });
          bot.once('message', (mUrl) => {
            if (chatId === mUrl.chat.id) {

              initMovie.url = mUrl.text;
              const urlChatId = mUrl.chat.id;
              bot.sendMessage(mUrl.chat.id, '*Enter the image URL for preview of the movie:*', { parse_mode: 'Markdown' });

              bot.once('message', (mImgPreview) => {
                if (urlChatId === mImgPreview.chat.id) {
                  initMovie.imgPreview = mImgPreview.text;
                  const imgChatId = mImgPreview.chat.id;
                  bot.sendMessage(mImgPreview.chat.id, '*Enter the title of the movie:*', { parse_mode: 'Markdown' });

                  bot.once('message', (mtitle) => {
                    if (imgChatId === mtitle.chat.id) {
                      initMovie.title = mtitle.text;
                      const titleChatId = mtitle.chat.id;
                      bot.sendMessage(mtitle.chat.id, '*Enter the language of the movie:*', {
                        parse_mode: 'Markdown'
                      });

                      bot.once('message', (mlang) => {
                        if (titleChatId === mlang.chat.id) {
                          initMovie.lang = mlang.text;
                          const langChatId = mlang.chat.id;
                          bot.sendMessage(mlang.chat.id, '*Enter the country of the movie:*', {
                            parse_mode: 'Markdown'
                          });

                          bot.once('message', (mcountry) => {
                            if (langChatId === mcountry.chat.id) {
                              initMovie.country = mcountry.text;
                              const countryChatId = mcountry.chat.id;
                              bot.sendMessage(mcountry.chat.id, '*Enter the genre of the movie:*', {
                                parse_mode: 'Markdown'
                              });

                              bot.once('message', (mgenre) => {
                                if (countryChatId === mgenre.chat.id) {
                                  initMovie.genre = mgenre.text;
                                  const genreChatId = mgenre.chat.id;
                                  bot.sendMessage(mgenre.chat.id, '*Enter the year of release of the movie:*', {
                                    parse_mode: 'Markdown'
                                  });

                                  bot.once('message', (myearOfRelease) => {
                                    if (genreChatId === myearOfRelease.chat.id) {
                                      initMovie.year = myearOfRelease.text;
                                      const yearOfReleaseChatId = myearOfRelease.chat.id;
                                      bot.sendMessage(myearOfRelease.chat.id, '*Enter the code of the movie:*', {
                                        parse_mode: 'Markdown'
                                      });

                                      bot.once('message', async (mcode) => {
                                        if (yearOfReleaseChatId === mcode.chat.id) {
                                          if (mcode.text.toLowerCase() === '/empty') {
                                            bot.sendMessage(mcode.chat.id, 'Code remains unchanged.', {
                                              reply_to_message_id: mcode.message_id
                                            });
                                          } else {
                                            initMovie.code = mcode.text;
                                            await bot.sendMessage(chatId, `The movie has been added with the code "${initMovie.code}".`, { parse_mode: 'Markdown' });
                                            await bot.sendMessage(mcode.chat.id, `<pre>${JSON.stringify(initMovie, null, 4)}</pre>`, { disable_web_page_preview: true, parse_mode: 'HTML' })
                                            await bot.sendPhoto(chatId, initMovie.imgPreview, {
                                              caption: `
🎬Movie Title: ${initMovie.title}
➖➖➖➖➖➖➖➖➖➖➖➖➖
🇬🇧Language: ${initMovie.lang}
🌐Country: ${initMovie.country}
🗓Released: ${initMovie.year}
🎞Genre: ${initMovie.genre}
Follow us here: <a href="https://instagram.com/eng.movles?igshid=azZ0cm9zbWI1eXA5">Instagram</a> | <a href="https://youtube.com/@eng.movles?feature=shared">YouTube</a>
                                              `,
                                              parse_mode: 'Markdown',
                                              reply_markup: {
                                                inline_keyboard: [
                                                  [
                                                    {
                                                      text: 'Watch here',
                                                      url: initMovie.url
                                                    }
                                                  ]
                                                ]
                                              },
                                              disable_web_page_preview: true,
                                            })
                                            await bot.sendMessage(chatId, 'Is everything OK?\nDo you want to change anything?', {
                                              reply_markup: {
                                                keyboard: [
                                                  [
                                                    '✍️Yes, I want to change it',

                                                    '🗣No, post it to the public',
                                                  ]
                                                ],
                                                resize_keyboard: true
                                              }
                                            });
                                          }
                                        }
                                      })
                                    }
                                  });
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
          break;
        case '✍️Yes, I want to change it':
        case '✍️back to change list':
          bot.sendMessage(chatId, 'Choose which section you want to change:', {
            reply_markup: {
              keyboard: [
                ['🔗URL', '🖼Image', '🇵🇸Language'],
                ['🎫Title', '🎞Genre', '🌏Country'],
                ['📟Code', '📅Released'],
                ['🔙Back to post movie']
              ],
              resize_keyboard: true,
              one_time_keyboard: true,
            }
          });
          break;
        case '🖼Image':
          initMovie.imgPreview = await changeElement(chatId, "Preview", initMovie.imgPreview);
          break;
        case '🔗URL':
          initMovie.url = await changeElement(chatId, "URL", initMovie.url);
          break;
        case '🇵🇸Language':
          initMovie.lang = await changeElement(chatId, "Language", initMovie.lang);
          break;
        case '🎫Title':
          initMovie.title = await changeElement(chatId, "Title", initMovie.title);
          break;
        case '🌏Country':
          initMovie.country = await changeElement(chatId, "Country", initMovie.country);
          break;
        case '📅Released':
          initMovie.year = await changeElement(chatId, "Release data", initMovie.year);
          break;
        case '🎞Genre':
          initMovie.genre = await changeElement(chatId, "Genre", initMovie.genre);
          break;
        case '📟Code':
        case '📟Change code':
          initMovie.code = await changeElement(chatId, "Code", initMovie.code);
          break;
        case '🏃🏿Go to post movie':
        case '🔙Back to post movie':
          // await addNewMovie(chatId, code, url, imgPreview, title, lang, country, genre, year);
          await bot.sendMessage(chatId, `<pre>${JSON.stringify(initMovie, null, 4)}</pre>`, { disable_web_page_preview: true, parse_mode: 'HTML' })
          await bot.sendPhoto(chatId, initMovie.imgPreview, {
            caption: `<b>
🎬Movie Title: ${initMovie.title}
➖➖➖➖➖➖➖➖➖➖➖➖➖
🇬🇧Language: ${initMovie.lang}
🌐Country: ${initMovie.country}
🗓Released: ${initMovie.year}
🎞Genre: ${initMovie.genre}

Follow us here: <a href="https://instagram.com/eng.movles?igshid=azZ0cm9zbWI1eXA5">Instagram</a> | <a href="https://youtube.com/@eng.movles?feature=shared">YouTube</a>
                                           </b>`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Watch here',
                    url: initMovie.url
                  }
                ]
              ]
            },
            disable_web_page_preview: true
          })
          await bot.sendMessage(chatId, 'Is everything OK?\nDo you want to change anything?', {
            reply_markup: {
              keyboard: [
                [
                  '✍️Yes, I want to change it',

                  '🗣No, post it to the public',
                ]
              ],
              resize_keyboard: true
            }
          });
          break;
        case '🗣No, post it to the public':
          movies.insertOne(initMovie).then(() => {
            bot.sendMessage(chatId, 'Thank you, you successfully added a new movie', {
              reply_markup: {
                keyboard: [
                  ["📽 add new movie", "🔑 log out"]
                ],
                resize_keyboard: true,
              }
            });
            initMovie = {
              url: "",
              imgPreview: "",
              title: "",
              lang: "",
              code: "",
              year: "",
              genre: "",
              country: ""
            }
          }).catch(e => {
            bot.sendMessage(chatId, e);
          });
          break;
        default:
          if (Number(msg.text)) {
            try {
              // Use await here to wait for the result of findOne
              let getmovie = await movies.findOne({ code: msg.text });

              if (getmovie) {
                // If a movie is found, send the details
                await bot.sendPhoto(chatId, getmovie.imgPreview, {
                  caption: `<b>
🎬Movie Title: ${getmovie.title}
➖➖➖➖➖➖➖➖➖➖➖➖➖
🇬🇧Language: ${getmovie.lang}
🌐Country: ${getmovie.country}
🗓Released: ${getmovie.year}
🎞Genre: ${getmovie.genre}

Follow us here: <a href="https://instagram.com/eng.movles?igshid=azZ0cm9zbWI1eXA5">Instagram</a> | <a href="https://youtube.com/@eng.movles?feature=shared">YouTube</a>
                    </b>`,
                  parse_mode: 'HTML',
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: 'Watch here',
                          url: getmovie.url
                        }
                      ]
                    ]
                  },
                  disable_web_page_preview: true
                });
              }
            } catch (error) {
              console.error('Error searching for movie by code:', error);
              bot.sendMessage(chatId, 'Error searching for movie. Please try again.');
            }
          }
          break;

      }
    })
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });




function changeElement(chatId, elName, variable) {
  return new Promise((resolve, reject) => {
    bot.sendMessage(chatId, `Send me the new ${elName} to change:\n_or send /empty to remain it unchanged_`, { parse_mode: 'Markdown' });

    bot.once('message', async (put) => {
      if (put.text.toLowerCase() === '/empty') {
        bot.sendMessage(put.chat.id, `${elName} remains unchanged.`, {
          reply_to_message_id: put.message_id
        });
        resolve(variable);
      } else {
        variable = put.text;
        try {
          bot.sendMessage(put.chat.id, `Congratulations! You successfully updated ${elName}:\n<pre>${variable}</pre>`, {
            reply_to_message_id: put.message_id,
            parse_mode: 'HTML',
            reply_markup: {
              keyboard: [
                ['✍️back to change list', '🏃🏿Go to post movie'],
              ],
              resize_keyboard: true,
            }
          });
          resolve(variable);
        } catch (error) {
          console.error(`Error updating ${elName}:`, error);
          bot.sendMessage(put.chat.id, `Error updating ${elName}. Please try again.`, {
            reply_to_message_id: put.message_id
          });
          reject(error);
        }
      }
    });
  });
}