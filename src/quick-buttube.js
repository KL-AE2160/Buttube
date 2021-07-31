const DisTube = require('distube')
const { MessageButton, MessageActionRow, MessageMenuOption, MessageMenu } = require('discord-buttons'); 
const {MessageEmbed} = require("discord.js")
class quickbuttube {
    /**
     * 
     * @param {Discord.Client} client - A discord.js client.
     */

    constructor(client) {

        if (!client) throw new Error("A client wasn't provided.");
        this.client = client;
        this.distube = new DisTube(client, { searchSongs: false, emitNewSongOnly: true });
        const quickdb = require('./db/index.js');
        this.db = quickdb()
    };
    
        
    async setup(message){
        message.delete()
        const stop = new MessageButton()
      .setLabel('stop')
      .setStyle('red')
      .setID('stop');
      const pause = new MessageButton()
      .setLabel('pause')
      .setStyle('blurple')
      .setID('pause');
      const resume = new MessageButton()
      .setLabel('resume')
      .setStyle('green')
      .setID('resume');
      const skip = new MessageButton()
      .setLabel('skip')
      .setStyle('grey')
      .setID('skip');
      const que = new MessageButton()
      .setLabel('Get que')
      .setStyle('blurple')
      .setID('que');
      const row = new MessageActionRow()
      .addComponent(stop)
      .addComponent(pause)
      .addComponent(resume)
      .addComponent(skip)
      .addComponent(que);
      const volume = new MessageButton()
      .setLabel('Set Volume')
      .setStyle('grey')
      .setID('volume')
      const row2 = new MessageActionRow()
      .addComponent(volume)
 const musicem = new MessageEmbed()
.setTitle('Not Playing')
 .setImage(`https://i.imgur.com/msgNNqN.gif`)
        this.msg = await  message.channel.send({embed:musicem,components:[row, row2]})
        this.db.set(`${message.guild.id}`, `${this.msg.id}`)
    }
    async play(message, music){
      this.events(message)
        this.distube.play(message, music)
        message.delete()
    }
     async volume(message, percent){
        this.distube.setVolume(message, percent)
        message.delete()
        message.channel.send(`Volume is now set to ${percent}%`).then(m => m.delete({ timeout: 5000 })
    )
    }
async events(message){
  const msgId = await this.db.get(`${message.guild.id}`)
  const msg = await message.channel.messages.fetch(msgId)
    this.distube
 .on("playSong", (message, queue, song) =>{
 const embed1 = new MessageEmbed()
    .setTitle(`Now Playing ${song.name}`)
    .setImage(`${song.thumbnail}`)  
  msg.edit(embed1)
    })
	.on("addSong", (message, queue, song) => message.channel.send(
        `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
    ).then(m => m.delete({ timeout: 5000 })
    ))
    .on("finish", (message, que, song) =>{
const embed = new MessageEmbed()
    .setTitle('Not Playing')
    .setImage(`https://i.imgur.com/msgNNqN.gif`)
    msg.edit(embed)
    });
}
async button(button){
    const embed = new MessageEmbed()
    .setTitle('Not Playing')
    .setImage(`https://i.imgur.com/msgNNqN.gif`)
  const message = button.message;
  if(button.id == 'stop'){
    this.distube.stop(message)
    button.message.edit(embed)
    button.reply.send('Stopped', true)
  }else if(button.id == 'pause'){
    this.distube.pause(message)
    button.reply.send('Paused', true)
  }else if(button.id == 'resume'){
    this.distube.resume(message)
    button.reply.send('Resumed', true)
  }else if(button.id == 'que'){
    let queue = this.distube.getQueue(message);
        let curqueue = queue.songs.map((song, id) =>
        `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
        ).join("\n");
    button.reply.send(curqueue, true)
  }else if(button.id == 'skip'){
    this.distube.skip(message)
    button.reply.send('Skipped', true)
}else if(button.id == 'volume'){
  button.reply.send('Please send the amount of volume in percentage (eg- 10)', true)
 const filter = m => m.author.id == button.clicker.id
 const collector = await button.channel.createMessageCollector(filter, { time: 30000 })
 collector.on('collect', async (msg) => {
   msg.delete()
   if (!msg.content){
     return collector.stop('error');
     }else if(isNaN(msg.content)){
       return collector.stop('num');
     }else{
       this.distube.setVolume(message, msg.content)
       button.reply.edit(`volume is now set to ${msg.content}%`, true)
       collector.stop('done')
     }
 })
 collector.on('end', async (msgs, reason) => {
   if(reason == 'error') return button.reply.edit('Please send something', true);
   if(reason == 'num') return button.reply.edit('Please send a number', true);
   if(reason == 'time') return button.reply.edit('You did not reply on time');
})
    }
}}

module.exports =  quickbuttube;