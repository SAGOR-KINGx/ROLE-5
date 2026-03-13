const express = require("express");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5000;

let botProcess = null;
let logs = [];
let startTime = Date.now();
let activity = 0;

/* remove ansi */

function clean(text){
return text.replace(/\x1B[[0-9;]*m/g,"");
}

/* static */

app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"public","index.html"));
});

/* STATUS */

app.get("/api/status",(req,res)=>{

const total=os.totalmem()/1024/1024;
const free=os.freemem()/1024/1024;

const ram=(total-free).toFixed(2);
const cpu=os.loadavg()[0].toFixed(2);

const uptime=Math.floor((Date.now()-startTime)/1000);

let commands=0;
let events=0;

try{

const cmdPath=path.join(__dirname,"scripts","cmds");
const eventPath=path.join(__dirname,"scripts","events");

if(fs.existsSync(cmdPath))
commands=fs.readdirSync(cmdPath).length;

if(fs.existsSync(eventPath))
events=fs.readdirSync(eventPath).length;

}catch{}

res.json({

cpu,
ram,
uptime,

ping:Math.floor(Math.random()*20)+20,

activity,

commandsCount:commands,
eventsCount:events,

online:botProcess?true:false

});

});

/* LOG API */

app.get("/api/logs",(req,res)=>{
res.json(logs.slice(-400));
});

/* BOT START */

app.get("/api/start",(req,res)=>{

if(botProcess) return res.send("Already running");

startBot();

res.send("Bot started");

});

/* BOT STOP */

app.get("/api/stop",(req,res)=>{

if(botProcess){

botProcess.kill();
botProcess=null;

}

res.send("Bot stopped");

});

/* BOT RESTART */

app.get("/api/restart",(req,res)=>{

if(botProcess) botProcess.kill();

startBot();

res.send("Bot restarted");

});

/* BOT RUN */

function startBot(){

botProcess=spawn("node",["SaGor.js"],{
cwd:__dirname,
shell:true
});

botProcess.stdout.on("data",(data)=>{

const msg=clean(data.toString().trim());

logs.push(msg);
activity++;

if(logs.length>500) logs.shift();

});

botProcess.stderr.on("data",(data)=>{

const msg=clean(data.toString().trim());

logs.push("[ERROR] "+msg);
activity++;

});

}

app.listen(PORT,"0.0.0.0",()=>{
console.log("Dashboard running "+PORT);
});
