const _         = require('lodash')
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
global.io       = require('socket.io')(server)
const PORT      = config.port

global.client    = new Discord.Client()
global.songQueue = []
global.msgArr = []
global.np = {title:`// Nothing right now!`,thumb:`img/default_thumb.png`}

client.login(config.token)

client.on('ready', () => {
  global.broadcast = client.createVoiceBroadcast()
  console.log(`\n\x1b[35m\x1b[1m${config.name} Startup //\x1b[0m Connected to Discord`)
  broadcast.on('end', ()=>{
    lib.queueSong()
  })
})


client.on('message', (message) => {
  if(message.author.bot) return
  let trigger = config.name.toLowerCase()
  if(!message.content.toLowerCase().match(trigger) && !message.mentions.users.get(client.user.id)) return
  if (message.content.toLowerCase().match(/join/)) return lib.join(message)
  if (message.content.toLowerCase().match(/leave/)) return lib.leave(message)
  if (message.content.toLowerCase().match(/skip/)) broadcast.emit('end')
  return lib.join(message)
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
  io.emit('npInfo', np)
  socket.on('chatMsg', function(msg){
    chatMsg(msg)
    lib.play(msg)
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
    console.log(`\n\x1b[35m\x1b[1m${config.name} Startup //\x1b[0m Listening on *:${PORT}${!e && r.statusCode===200 ? ` (External IP: ${b.replace(/\r?\n|\r/,'')})`:``}`)
  })
  msgArr.push(serverMsg(`Server initialized at ${new Date(Date.now()).toLocaleString()}`))
})
