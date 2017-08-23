const _             = require('lodash')
const clc           = require('cli-color')
const path          = require('path')
const request       = require('request')
const Discord       = require('discord.js')
const ytdl          = require('ytdl-core')
const config        = require('./config')

const streamOptions = {passes:2, volume:0.15}

class Embed {
  constructor(text,message) {
    return ({embed:new Discord.RichEmbed().setDescription(text).setColor(`${message.guild.me.displayHexColor!=='#000000' ? message.guild.me.displayHexColor : config.hexColour}`)});
  }
}

class Lib {

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
            let stream = ytdl(res.id.videoId, {
              filter : 'audioonly'
            })
            broadcast.playStream(stream, streamOptions)
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
        return message.member.voiceChannel.join()
      }
    }else {
      message.channel.send(new Embed(`**ERROR:** User is not connected to a Voice Channel`,message))
    }
  }

  leave(message){
    let vc = client.voiceConnections.get(message.guild.id);
    if (vc) vc.disconnect();
  }

}

module.exports = new Lib();
