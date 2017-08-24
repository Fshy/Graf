const _             = require('lodash')
const path          = require('path')
const request       = require('request')
const Discord       = require('discord.js')
const ytdl          = require('ytdl-core')
const config        = require('./config')

const streamOptions = {passes:2, volume:0.15}

global.embedMsg = function (text,message) {
  return ({embed:new Discord.RichEmbed().setDescription(text).setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
}

global.chatMsg = function (msg) {
  if (msgArr.length>=24)
    msgArr.shift()
  msgArr.push(`<span style="color:#000">[${new Date(Date.now()).toLocaleString()}]</span> ${msg}<br>`)
  io.emit('chatArr', msgArr)
}

global.serverMsg = function (msg) {
  if (msgArr.length>=24)
    msgArr.shift()
  msgArr.push(`<span style="color:#848484">📡 ${msg}</span><br>`)
  io.emit('chatArr', msgArr)
}

class Lib {

  queueSong(){
    if (songQueue.length>0) {
      var poppedSong = songQueue.shift();
      np = {title:poppedSong.snippet.title,thumb:poppedSong.snippet.thumbnails.default.url}
      io.emit('npInfo', np)
      io.emit('songQueue', songQueue)
      client.setTimeout(function () {
        broadcast.playStream(ytdl(poppedSong.id.videoId, {filter : 'audioonly'}), streamOptions)
        client.user.setPresence({ game: { name: `${poppedSong.snippet.title}`, type: 0 } })
      }, 250);
    }else {
      client.user.setPresence({ game: null })
      np = {title:`// Nothing right now!`,thumb:`img/default_thumb.png`}
      io.emit('npInfo', np)
      // clear everything
    }
  }

  play(message){
    if (message) {
      let match = message.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
      if (match) {
        request(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${match[2]}&key=${config.keys.youtube}`, function (error, response, body) {
          // TODO link parsing
        });
      }else {
        let expr = message.split(/\s+/g).join('+');
        request(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${expr}&type=video&videoCategoryId=10&key=${config.keys.youtube}`, function (error, response, body) {
          if (!error && response.statusCode===200) {
            body = JSON.parse(body);
            if (!body.items[0]) return;
            let res = body.items[0]
            songQueue.push(res)
            io.emit('songQueue', songQueue)
            serverMsg(`Queued: ${res.snippet.title}`)
            // console.log(`📡 Queued: ${res.snippet.title}`);
            if (!broadcast.currentTranscoder){
              var poppedSong = songQueue.pop()
              io.emit('songQueue', songQueue)
              broadcast.playStream(ytdl(poppedSong.id.videoId, {filter : 'audioonly'}), streamOptions)
              np = {title:poppedSong.snippet.title,thumb:poppedSong.snippet.thumbnails.default.url}
              io.emit('npInfo', np)
              client.user.setPresence({ game: { name: `${poppedSong.snippet.title}`, type: 0 } })
            }
          }else {
            console.log(`Could not access YouTube API`);
          }
        });
      }
    }else {
      console.log('Empty Message');
    }
  }

  join(message){
    if (message.member.voiceChannel) {
      const voiceChannel = message.member.voiceChannel
      if (!voiceChannel.permissionsFor(message.client.user).has('CONNECT') || !voiceChannel.permissionsFor(message.client.user).has('SPEAK')){
        // var padding = ''
        // for (var x = voiceChannel.name.length+1; x < 38; x++) padding+=' '
        // return message.channel.send(lib.embed(`**ERROR:** Insufficient permissions\n\`\`\`${voiceChannel.name} ${padding}Speak ${voiceChannel.speakable ? '✔':'✘'} | Join ${voiceChannel.joinable ? '✔':'✘'}\`\`\``,message))
      }else {
        message.member.voiceChannel.join().then(connection => {connection.playBroadcast(broadcast)})
      }
    }else {
      message.channel.send(embedMsg(`**ERROR:** User is not connected to a Voice Channel`,message))
    }
  }

  leave(message){
    let vc = client.voiceConnections.get(message.guild.id);
    if (vc) vc.disconnect();
  }

}

module.exports = new Lib();
