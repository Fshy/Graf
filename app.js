const _         = require('lodash')
const clc       = require('cli-color')
const path      = require('path')
const request   = require('request')
const Discord   = require('discord.js')
const ytdl      = require('ytdl-core')
const lib       = require('./lib')
const config    = require('./config')

const express   = require('express')
const app       = express()
const router    = express.Router()

const server    = require('http').createServer(app)
const io        = require('socket.io')(server)
const PORT      = config.port

global.client    = new Discord.Client()
var msgArr = []

client.login(config.token)

client.on('ready', () => {
  global.broadcast = client.createVoiceBroadcast()
  console.log(clc.magentaBright(`${config.name} Startup // `)+`Connected to Discord`)
})

client.on('message', (message) => {
  if(message.author.bot) return
  let trigger = config.name.toLowerCase()
  if(!message.content.toLowerCase().match(trigger) && !message.mentions.users.get(client.user.id)) return
  if (message.content.toLowerCase().match(/join/)) return lib.join(message).then(connection => {connection.playBroadcast(broadcast)})
  if (message.content.toLowerCase().match(/leave/)) return lib.leave(message)
})

client.on('voiceStateUpdate', (oldMember,newMember) => {
  if (client.user.id!==newMember.user.id) return
  if (!newMember.voiceChannel) return
  let vconnec = client.voiceConnections.get(newMember.guild.id)
  if (vconnec) {
    let dispatch = vconnec.player.dispatcher;
    if (dispatch)
      dispatch.end()
  }
  newMember.voiceChannel.join()
    .then(connection => {
      connection.playBroadcast(broadcast)
    })
})

io.on('connection', function(socket){
  io.emit('chatArr', msgArr)
  socket.on('chatMsg', function(msg){
    if (msgArr.length>=30)
      msgArr.shift()
    msgArr.push(`<span style="color:#000">[${new Date(Date.now()).toLocaleString()}]</span> ${msg}<br>`)
    lib.play(msg)
    io.emit('chatArr', msgArr)
  })
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))

router.get('/', function (request, response) {
  response.render('index')
})

app.use('/', router)

server.listen(PORT, function () {
  request(`http://myexternalip.com/raw`, function (e, r, b){
    console.log(clc.magentaBright(`${config.name} Startup // `)+`Listening on *:${PORT}${!e && r.statusCode===200 ? ` (External IP: ${b.replace(/\r?\n|\r/,'')})`:``}`)
  })
  msgArr.push(`Server initialized at <span style="color:#000">${new Date(Date.now()).toLocaleString()}</span><br>`)
})
