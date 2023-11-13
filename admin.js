const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const TOKEN1 = process.env.TOKEN1;
const TOKEN2 = process.env.TOKEN;

const bot1 = new TelegramBot(TOKEN1, {
  polling: {
    interval: 500,
    params: {
      timeout: 1
    }
  }
});
const bot2 = new TelegramBot(TOKEN2, {
  polling: {
    interval: 500,
    params: {
      timeout: 1
    }
  }
});

let url = '';
let imgPreview = '';
let title = '';
let lang = '';
let country = '';
let genre = '';
let year = '';
let code = null;

bot1.onText(/\/start/, (msg) => {
  let a
  fetch('http://localhost:3000/movies').then(res => res.json()).then(data => a = data)
  console.log(a);
  const id = msg.chat.id;
  const html = `👋  Hello, ${msg.from.first_name}!

✍️  Send me the code of the movie you're searching for. For example: 1111, 1234

YouTube`;

  bot1.sendMessage(id, html, {
    parse_mode: 'HTML',
    disable_web_page_preview: true
  });
});

bot1.onText(/\/admin/, (msg) => {
  const id = msg.chat.id;
  const message_id = msg.message_id;

  const text = 'Hello, Admin.\nWhat are we going to do? ';
  bot1.sendMessage(id, text, {
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
});

function addNewMovie(chatId, code, url, imgPreview, title, lang, country, genre, year) {

  bot1.sendMessage(chatId, `The movie has been added with the code "${code}".`, { parse_mode: 'Markdown' });

  bot1.sendPhoto(chatId, imgPreview, {
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

  bot1.sendMessage(chatId, 'Is everything OK?\nDo you want to change anything?', {
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
  bot1.on('message', async (msg) => {
    switch (msg.text) {
      case '🗣No, post it to the public':
        try {
          const moviesResponse = await fetch('http://localhost:3000/movies');
          const movies = await moviesResponse.json();

          let codeExists = false;

          for (const existingMovie of movies) {
            if (existingMovie.code === movie.code) {
              codeExists = true;
              break;
            }
          }

          if (codeExists) {
            // If the code already exists, send a message to change the code
            bot1.sendMessage(chatId, 'Ops! The code is the same as one of the other movies.\nPlease change it :(', {
              reply_markup: {
                inline_keyboard: [
                  [
                    '📟Change code',
                  ]
                ]
              }
            });
          } else {
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
            bot1.sendMessage(msg.message.chat.id, `You have successfully posted a new movie:\n<pre>${JSON.stringify(movie, null, 4)}</pre>`, {
              parse_mode: 'HTML',
            });

            console.log('Success:', postData);
          }
        } catch (error) {
          console.error('Error:', error);
          bot1.sendMessage(msg.message.chat.id, `Error posting the movie: ${error.message}`);
        }
        break;
      default:
        break;
    }
  });
}

bot1.on('message', (msg) => {
  if (msg.text === '📽 add new movie') {
    const chatId = msg.chat.id;
    bot1.sendMessage(chatId, '*Enter the movie URL:*', {
      parse_mode: 'Markdown',
      reply_markup: {
        remove_keyboard: true
      }
    });
    bot1.once('message', (msgUrl) => {
      if (chatId === msgUrl.chat.id) {
        url = msgUrl.text;
        const urlChatId = msgUrl.chat.id;
        bot1.sendMessage(msgUrl.chat.id, '*Enter the image URL for preview of the movie:*', { parse_mode: 'Markdown' });

        bot1.once('message', (msgImgPreview) => {
          if (urlChatId === msgImgPreview.chat.id) {
            imgPreview = msgImgPreview.text;
            const imgChatId = msgImgPreview.chat.id;
            bot1.sendMessage(msgImgPreview.chat.id, '*Enter the title of the movie:*', { parse_mode: 'Markdown' });

            bot1.once('message', (msgtitle) => {
              if (imgChatId === msgtitle.chat.id) {
                title = msgtitle.text;
                const titleChatId = msgtitle.chat.id;
                bot1.sendMessage(msgtitle.chat.id, '*Enter the language of the movie:*', {
                  parse_mode: 'Markdown'
                });

                bot1.once('message', (msglang) => {
                  if (titleChatId === msglang.chat.id) {
                    lang = msglang.text;
                    const langChatId = msglang.chat.id;
                    bot1.sendMessage(msglang.chat.id, '*Enter the country of the movie:*', {
                      parse_mode: 'Markdown'
                    });

                    bot1.once('message', (msgcountry) => {
                      if (langChatId === msgcountry.chat.id) {
                        country = msgcountry.text;
                        const countryChatId = msgcountry.chat.id;
                        bot1.sendMessage(msgcountry.chat.id, '*Enter the genre of the movie:*', {
                          parse_mode: 'Markdown'
                        });

                        bot1.once('message', (msggenre) => {
                          if (countryChatId === msggenre.chat.id) {
                            genre = msggenre.text;
                            const genreChatId = msggenre.chat.id;
                            bot1.sendMessage(msggenre.chat.id, '*Enter the year of release of the movie:*', {
                              parse_mode: 'Markdown'
                            });

                            bot1.once('message', (msgyearOfRelease) => {
                              if (genreChatId === msgyearOfRelease.chat.id) {
                                year = msgyearOfRelease.text;
                                const yearOfReleaseChatId = msgyearOfRelease.chat.id;
                                bot1.sendMessage(msgyearOfRelease.chat.id, '*Enter the code of the movie:*', {
                                  parse_mode: 'Markdown'
                                });

                                bot1.once('message', (msgcode) => {
                                  if (yearOfReleaseChatId === msgcode.chat.id) {
                                    code = msgcode.text;
                                    const codeChatId = msgcode.chat.id;
                                    addNewMovie(chatId, code, url, imgPreview, title, lang, country, genre, year);
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
      }
    });
  }
});



function addNewMovie(chatId, code, url, imgPreview, title, lang, country, genre, year) {

  bot1.sendMessage(chatId, `The movie has been added with the code "${code}".`, { parse_mode: 'Markdown' });

  bot1.sendPhoto(chatId, imgPreview, {
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

  bot1.sendMessage(chatId, 'Is everything OK?\nDo you want to change anything?', {
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
  bot1.on('message', async (msg) => {
    switch (msg.text) {

      default:
        break;
    }
  });
}


function changeElement(chatId, elName, variable) {
  return new Promise((resolve, reject) => {
    bot1.sendMessage(chatId, `Send me the new ${elName} to change:\n_or send /empty to remain it unchanged_`, { parse_mode: 'Markdown' });

    bot1.once('message', async (put) => {
      if (put.text.toLowerCase() === '/empty') {
        bot1.sendMessage(put.chat.id, `${elName} remains unchanged.`, {
          reply_to_message_id: put.message_id
        });
        resolve(variable);
      } else {
        variable = put.text;
        try {
          // You can add additional validation for URL if needed

          bot1.sendMessage(put.chat.id, `Congratulations! You successfully updated ${elName}:\n<pre>${variable}</pre>`, {
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
          bot1.sendMessage(put.chat.id, `Error updating ${elName}. Please try again.`, {
            reply_to_message_id: put.message_id
          });
          reject(error);
        }
      }
    });
  });
}


// Function to handle callback queries
bot1.on('message', async (m) => {
  const chatId = m.chat.id;

  switch (m.text) {
    case '✍️Yes, I want to change it':
    case '✍️back to change list':
      bot1.sendMessage(chatId, 'Choose which section you want to change:', {
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
          bot1.sendMessage(chatId, 'Ops! The code is the same as one of the other movies.\nPlease change it :(', {
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
            id: Number(code),
            year: year,
            genre: genre,
            country: country,
          }
          let url = '';
          let imgPreview = '';
          let title = '';
          let lang = '';
          let country = '';
          let genre = '';
          let year = '';
          let code = null;
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
          bot1.sendMessage(chatId, `You have successfully posted a new movie:\n<pre>${JSON.stringify(movie, null, 4)}</pre>`, {
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

          console.log('Success:', postData);
        }
      } catch (error) {
        console.error('Error:', error);
        bot1.sendMessage(chatId, `Error posting the movie: ${error.message}`);
      }
      break;
    default:
      break;
  }
});







































// user.js
bot2.onText(/\/start/, (msg) => {
  const id = msg.chat.id;
  const html = `<b>👋Hello, ${msg.from.first_name}!

✍️Send me the code of the movie you're searching for. For example: 2021, 1221</b>`;
  bot2.sendMessage(id, html, {
    parse_mode: 'HTML',
    disable_web_page_preview: true
  });
});

bot2.on('message', async m => {
  const chatId = m.chat.id;
  if (m.text.length >= 4 && !isNaN(Number(m.text))) {
    try {
      // Check if the message is a number (potential movie ID)
      const movieId = parseInt(m.text);
      if (!isNaN(movieId)) {
        const moviesResponse = await fetch(`http://localhost:3000/movies/${movieId}`);
        if (moviesResponse.ok) {
          const movie = await moviesResponse.json();

          // Display movie information
          bot2.sendPhoto(chatId, movie.imgPreview, {
            caption: `*🎬Movie Title: ${movie.title.toUpperCase()}
  ______________________
  🇬🇧Language: ${movie.lang.charAt(0).toUpperCase() + movie.lang.slice(1).toLowerCase()};
  🌐Country: ${movie.country.charAt(0).toUpperCase() + movie.country.slice(1).toLowerCase()};
  🗓Released: ${movie.year};
  🎞Genre: ${movie.genre};*`,
            parse_mode: 'Markdown',
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
        } else {
          // Movie not found
          bot2.sendMessage(chatId, 'Movie not found.');
        }
      } else {
        // Invalid movie ID format
        bot2.sendMessage(chatId, 'Invalid movie ID format.');
      }
    } catch (error) {
      console.error('Error:', error);
      bot2.sendMessage(chatId, `Error searching for the movie: ${error.message}`);
    }
  } else {
    // Invalid movie ID format (length less than 4 or contains non-numeric characters)
    bot2.sendMessage(chatId, 'Invalid movie ID format.');
  }
});
