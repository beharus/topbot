const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const TOKEN = process.env.TOKEN;

// Create instances of the Telegram bots without starting polling
const bot = new TelegramBot(TOKEN, { polling: true });

// Handle polling errors for both bots
bot.on('polling_error', (error) => {
  console.error('Bot 1 Polling error:', error);
});


let url = '';
let imgPreview = '';
let title = '';
let lang = '';
let country = '';
let genre = '';
let year = '';
let code = null;



function addNewMovie(chatId, code, url, imgPreview, title, lang, country, genre, year) {

  bot.sendMessage(chatId, `The movie has been added with the code "${code}".`, { parse_mode: 'Markdown' });

  bot.sendPhoto(chatId, imgPreview, {
    caption: `*🎬Movie Title: ${title.toUpperCase()}
______________________
🇬🇧Language: ${lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()};
🌐Country: ${country.charAt(0).toUpperCase() + country.slice(1).toLowerCase()};
🗓Released: ${year};
🎞Genre: ${genre};*`,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Watch here',
            url: url
          }
        ]
      ]
    },
    disable_web_page_preview: true,
  });

  bot.sendMessage(chatId, 'Is everything OK?\nDo you want to change anything?', {
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
          // You can add additional validation for URL if needed

          bot.sendMessage(put.chat.id, `Congratulations! You successfully updated ${elName}:\n<pre>${variable}</pre>`, {
            reply_to_message_id: put.message_id,
            parse_mode: 'HTML',
            reply_markup: {
              keyboard: [
                ['✍️back to change list'],
                ['🏃🏿Go to post movie']
              ]
            },
            resize_keyboard: true,
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


// Function to handle callback queries
bot.on('message', async (m) => {
  const chatId = m.chat.id;

  switch (m.text) {
    case "/start":
      const html = `<b>👋Hello, ${m.from.first_name}!\n\n✍️Send me the code of the movie you're searching for. For example: 2021, 1221</b>`;
      bot.sendMessage(chatId, html, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
      break
    case '/admin':
      const id = m.chat.id;
      const message_id = m.message_id;

      const text = 'Hello, Admin.\nWhat are we going to do? ';
      bot.sendMessage(id, text, {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [
              '📽 add new movie',
              '🔐 log out'
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
          remove_keyboard: true
        }
      });
      break
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
      imgPreview = await changeElement(chatId, "Preview", imgPreview);
      break;
    case '🔗URL':
      url = await changeElement(chatId, "URL", url);
      break;
    case '🇵🇸Language':
      lang = await changeElement(chatId, "Language", lang);
      break;
    case '🎫Title':
      title = await changeElement(chatId, "Title", title);
      break;
    case '🌏Country':
      country = await changeElement(chatId, "Country", country);
      break;
    case '📅Released':
      year = await changeElement(chatId, "Release data", year);
      break;
    case '🎞Genre':
      genre = await changeElement(chatId, "Genre", genre);
      break;
    case '📟Code':
    case '📟Change code':
      code = await changeElement(chatId, "Code", code);
      break;
    case '🏃🏿Go to post movie':
    case '🔙Back to post movie':
      await addNewMovie(chatId, code, url, imgPreview, title, lang, country, genre, year);
      break;
    case '🗣No, post it to the public':
      try {
        const moviesResponse = await fetch('http://localhost:3000/movies');
        const movies = await moviesResponse.json();

        let codeExists = false;

        for (const existingMovie of movies) {
          if (existingMovie.code === code) {
            codeExists = true;
            break;
          }
        }

        if (codeExists) {
          // If the code already exists, send a message to change the code
          bot.sendMessage(chatId, 'Ops! The code is the same as one of the other movies.\nPlease change it :(', {
            reply_markup: {
              inline_keyboard: [
                [
                  '📟Change code',
                ]
              ]
            }
          });
        } else {
          let movie = {
            url: url,
            imgPreview: imgPreview,
            title: title,
            lang: lang,
            id: code,
            year: year,
            genre: genre,
            country: country,
          }
          // If the code doesn't exist, proceed to post the new movie
          const postResponse = await fetch('http://localhost:3000/movies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // You may need to include additional headers based on your API requirements
            },
            body: JSON.stringify(movie),
          });

          if (!postResponse.ok) {
            throw new Error(`HTTP error! Status: ${postResponse.status}`);
          }
          const postData = await postResponse.json();

          // Send success message to the user
          bot.sendMessage(chatId, `You have successfully posted a new movie:\n<pre>${JSON.stringify(movie, null, 4)}</pre>`, {
            parse_mode: 'HTML',
            reply_markup: {
              keyboard: [
                [
                  '📽 add new movie',
                  '🔐 log out'
                ]
              ],
              resize_keyboard: true,
              one_time_keyboard: true,
              remove_keyboard: true
            }
          });

          url = '';
          imgPreview = '';
          title = '';
          lang = '';
          country = '';
          genre = '';
          year = '';
          code = null;
          console.log('Success:', postData);
        }
      } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, `Error posting the movie: ${error.message}`);
      }
      break;
    case "📽 add new movie":
      bot.sendMessage(chatId, '*Enter the movie URL:*', {
        parse_mode: 'Markdown',
        reply_markup: {
          remove_keyboard: true
        }
      });
      bot.once('message', (mUrl) => {
        if (chatId === mUrl.chat.id) {
          url = mUrl.text;
          const urlChatId = mUrl.chat.id;
          bot.sendMessage(mUrl.chat.id, '*Enter the image URL for preview of the movie:*', { parse_mode: 'Markdown' });

          bot.once('message', (mImgPreview) => {
            if (urlChatId === mImgPreview.chat.id) {
              imgPreview = mImgPreview.text;
              const imgChatId = mImgPreview.chat.id;
              bot.sendMessage(mImgPreview.chat.id, '*Enter the title of the movie:*', { parse_mode: 'Markdown' });

              bot.once('message', (mtitle) => {
                if (imgChatId === mtitle.chat.id) {
                  title = mtitle.text;
                  const titleChatId = mtitle.chat.id;
                  bot.sendMessage(mtitle.chat.id, '*Enter the language of the movie:*', {
                    parse_mode: 'Markdown'
                  });

                  bot.once('message', (mlang) => {
                    if (titleChatId === mlang.chat.id) {
                      lang = mlang.text;
                      const langChatId = mlang.chat.id;
                      bot.sendMessage(mlang.chat.id, '*Enter the country of the movie:*', {
                        parse_mode: 'Markdown'
                      });

                      bot.once('message', (mcountry) => {
                        if (langChatId === mcountry.chat.id) {
                          country = mcountry.text;
                          const countryChatId = mcountry.chat.id;
                          bot.sendMessage(mcountry.chat.id, '*Enter the genre of the movie:*', {
                            parse_mode: 'Markdown'
                          });

                          bot.once('message', (mgenre) => {
                            if (countryChatId === mgenre.chat.id) {
                              genre = mgenre.text;
                              const genreChatId = mgenre.chat.id;
                              bot.sendMessage(mgenre.chat.id, '*Enter the year of release of the movie:*', {
                                parse_mode: 'Markdown'
                              });

                              bot.once('message', (myearOfRelease) => {
                                if (genreChatId === myearOfRelease.chat.id) {
                                  year = myearOfRelease.text;
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
                                        code = mcode.text;
                                        const codeChatId = mcode.chat.id;
                                        await addNewMovie(codeChatId, code, url, imgPreview, title, lang, country, genre, year);
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
      break
    case !'📟Code':
    case !'📟Change code':
    case !'Enter the code of the movie:':
    case !'Enter the year of release of the movie:':
    case !'Release':
    default:
      if (m.text.length >= 4 && !isNaN(Number(m.text))) {
        // Check if the message is a number (potential movie ID)
        const movieId = parseInt(m.text);
        if (!isNaN(movieId)) {
          const moviesResponse = await fetch(`http://localhost:3000/movies/${movieId}`);
          const movie = moviesResponse.ok ? await moviesResponse.json() : null;

          if (movie) {
            // Display movie information
            bot.sendPhoto(chatId, movie.imgPreview, {
              caption: `<b>🎬Movie Title: ${movie.title.toUpperCase()}
➖➖➖➖➖➖➖➖➖➖➖➖➖
🇬🇧Language: ${movie.lang.charAt(0).toUpperCase() + movie.lang.slice(1).toLowerCase()}
🌐Country: ${movie.country.charAt(0).toUpperCase() + movie.country.slice(1).toLowerCase()}
🗓Released: ${movie.year}
🎞Genre: ${movie.genre}
      
Follow us here: <a href='https://instagram.com/eng.movles?igshid=azZ0cm9zbWI1eXA5'>Instagram</a> | <a href='https://youtube.com/@eng.movles?feature=shared'>YouTube</a></b>`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Watch here',
                      url: movie.url
                    }
                  ]
                ]
              },
              disable_web_page_preview: true,
            });
          }
        } else {
          // Invalid movie ID format
          bot.sendMessage(chatId, 'Invalid movie ID format.');
        }
      }
  }
});
