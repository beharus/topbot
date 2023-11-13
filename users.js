const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(TOKEN, {
  polling: true
});

bot.onText(/\/start/, (msg) => {
  const id = msg.chat.id;
  const html = `<b>👋Hello, ${msg.from.first_name}!

✍️Send me the code of the movie you're searching for. For example: 2021, 1221</b>`;
  bot.sendMessage(id, html, {
    parse_mode: 'HTML',
    disable_web_page_preview: true
  });
});

bot.on('message', async m => {
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
          bot.sendPhoto(chatId, movie.imgPreview, {
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
          bot.sendMessage(chatId, 'Movie not found.');
        }
      } else {
        // Invalid movie ID format
        bot.sendMessage(chatId, 'Invalid movie ID format.');
      }
    } catch (error) {
      console.error('Error:', error);
      bot.sendMessage(chatId, `Error searching for the movie: ${error.message}`);
    }
  } else {
    // Invalid movie ID format (length less than 4 or contains non-numeric characters)
    bot.sendMessage(chatId, 'Invalid movie ID format.');
  }
});
