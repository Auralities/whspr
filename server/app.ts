import path from 'path'
import express, { Request, Response } from 'express'
import multer from 'multer'
import routes from './routes'
import axios, { AxiosResponse } from 'axios'
import textToSpeech from '@google-cloud/text-to-speech'
import * as protos from "@google-cloud/text-to-speech/build/protos/protos"
// const db = require('./db')
// const express = require('express')
// const session = require('express-session')
import OpenAI from 'openai'
import ElevenLabs from 'elevenlabs-node'
import cors from 'cors'
import http from 'http'
import {Server, Socket} from 'socket.io'
import {ExpressPeerServer} from 'peer'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config();
const {HOST, PORT, OPENAI_API_KEY, TTSKEY} = process.env

const clientPath = path.resolve(__dirname, '../client/dist')

const openai = new OpenAI();
const eleven = new ElevenLabs(
  { apiKey: TTSKEY,
    voiceId: 'DVYO7ONqCgr4Bp6CHC1c',
    //Knightly: PcDnPecxCbv82eDtxjXe, Guðrún: DVYO7ONqCgr4Bp6CHC1c
  }
);


const corsOptions = {
  origin: `http://${HOST}:${PORT}`,
  methods: ['GET', 'POST'],
}
const storage = multer.memoryStorage();
const upload = multer({storage: storage})



const postRoutes = require('./routes/postRoutes')
import { Sound, Post, User } from './dbmodels'


const app = express()
const session = require('express-session');
const crypto = require('crypto');
const passport = require('passport');
require('./auth');
const secret = crypto.randomBytes(64).toString('hex'); //secret hash for session
const cookieParser = require('cookie-parser');
const cookie = require('cookie');

app.use(cors())
app.use(upload.single('audio'))

app.use(cookieParser(secret, {sameSite: 'strict'}))
app.use(session({
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours 
  }
}))
app.use(passport.initialize());
app.use(passport.session());
const server = http.createServer(app)
const io = new Server(server)
// const peerServer = ExpressPeerServer(server, { path: '/peerjs'})

app.use(cors(corsOptions))
app.use(express.json())
// app.use('/peerjs', peerServer)
app.use(express.static(clientPath))




const routeHandler = express.Router()
routeHandler.use('/post', postRoutes)
//routeHandler.use('/search', searchRoutes)

app.use('/', routeHandler)
app.use('/', routes)

// COOKIE SETUP
const setCookie = cookie.serialize('session', 'whspr');

//AUTHENTICATION ROUTES
app.get('/auth/google', (req: Request, res: Response) => {
  passport.authenticate('google', { scope: ['email', 'profile'] })(req, res);
})

app.get('/google/callback',  passport.authenticate('google', {
  successRedirect: '/protected/feed',
  failureRedirect: '/auth/google/failure',
}),
(req: Request, res: Response) => {
  // set cookies
  res.setHeader('Set-Cookie', setCookie);
  req.session.save()

  res.redirect('/protected')
})


app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});

app.use('/logout', (req: Request, res: Response) => {
  req.session.destroy((err: any) => {
    if (err) {
      console.error(err);
    }
  })
  res.redirect('/');
})

//get current user
app.get('/current-user', async (req: Request, res: Response) => {
  //console.log('req.session', req);
    try {
      const results = await User.findOne({where: {googleId: req.user}})
      if(results){
        res.status(200).send(results);
      } else {
        res.status(404).send('User not found');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(500).send('Error fetching user');
    }
})


app.get('/getSoundURLPostId',  async (req, res) =>{
  const {postId} = req.query;
  if(!postId){
    console.error('post Id is undefined or null')
    res.send('post Id is undefined or null').status(400);
    return;
  }
  try{
    const soundRecord = await Sound.findOne({where: {postId}});
    if(!soundRecord){
      console.error('Sound record not found.')
      res.send('Sound record not found.').status(404);
      return
    }
    const soundUrl = soundRecord.get('soundUrl');
    if(soundUrl){
      res.status(200).send({soundUrl});
    }
  }catch(error){
    console.error('Nonspecific error retrieving audio id:', error);
    res.send('Nonspecific error retrieving audio id.').status(500)
  }
  })

app.post('/createPostRecord', async(req, res) =>{
   try{
      const postRecord = {
      userId: req.body.userId,
      title: req.body.title,
      category: req.body.category,
      soundUrl: req.body.soundUrl,
      likeCount: 0,
      commentCount: 0,
      listenCount: 0
      }
      await Post.create(postRecord)
      res.status(200).send('Post record created.')
    }catch(error){
      res.status(500).send('Nonspecific error in post create')
    }
  })

  // io.on('connection', (socket: Socket) => {
    //   console.log('Socket connected! ID: ', socket.id)
    //   socket.emit('id', socket.id)
    
    //   socket.on('disconnect', () => {
//     console.log('User disconnected')
//     io.emit('disconnected', socket.id)
//   })

//   socket.on('call', (data: dataObj) => {
  //     console.log('joined')
  //     io.to(data.userId).emit('call', {signal: data.signal, from: data.from, name: data.name})
  //   })
  
  //   socket.on('answer', (data: dataObj2) => {
    //     io.to(data.to).emit('accept', data.signal)
    //   })
    
    // })
   
    
  app.post('/openAIGetResponse', async (req, res) => {
  try {
    const { messages } = req.body;
    const request = {
      model: "gpt-3.5-turbo",
      messages: messages
    };
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    };
    const airesp = await axios.post('https://api.openai.com/v1/chat/completions', request, { headers: headers });
    const responseText = airesp.data.choices[0].message.content;
    res.status(200).send({ response: responseText });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

io.on('connection', (socket) => {
  console.log('User connected');
  
  socket.on('join-channel', (channelName, uid) => {
    socket.join(channelName);
    io.to(channelName).emit('user-joined', uid);
  });
  
  socket.on('leave-channel', () => {
    const rooms = Object.keys(socket.rooms);
    rooms.forEach((room) => {
      socket.leave(room);
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const speech = new textToSpeech.TextToSpeechClient({
  keyFilename: './key.json',
  projectId: 'whspr-406622'
})

app.post('/text-to-speech-google', async(req, res) =>{
  try{
    const text = req.body.text
    const request = {
      input: {text: text},
      voice: {languageCode: 'en-US', ssmlGender: protos.google.cloud.texttospeech.v1.SsmlVoiceGender.NEUTRAL},
      audioConfig: {audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3}
    }
    const [response] = await speech.synthesizeSpeech(request)
    res.status(200).send(response.audioContent)
  }catch(error){
    console.error('error in text to speech: ', error)
    res.status(500).send('Error synthesizing speech')
  }
})

app.post('/text-to-speech-openai', async(req, res) =>{
  const text = req.body.text
  try{
   const response = await openai.audio.speech.create({model: 'tts-1', input: text, voice: "fable"})
    const buffer = Buffer.from(await response.arrayBuffer())
    res.status(200).send(buffer)
  }catch(error){
    console.error('error in text to speech: ', error)
    res.status(500).send('Error synthesizing speech from open AI')
  }
})

app.post('/text-to-speech-elevenlabs', async(req, res) =>{
  const text = req.body.text
  try{
   const stream = await eleven.textToSpeechStream({textInput: text, responseType: 'stream'}) 
   res.setHeader('Content-Type', 'audio/mpeg')
    stream.pipe(res)
  }catch(error){
    console.error('error in text to speech: ', error)
    res.status(500).send('Error synthesizing speech from open AI')
  }
})

// MAKE SURE THIS IS LAST
app.get('/*', (req: Request, res: Response) => {
  res.sendFile(path.join(clientPath, 'index.html'))
})



export default server