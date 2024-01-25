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
import { v4 } from 'uuid';
import { promisify } from 'util'
import OpenAI from 'openai'
import ElevenLabs from 'elevenlabs-node'
import cors from 'cors'
import http from 'http'
import { Server, Socket } from 'socket.io'
import { ExpressPeerServer } from 'peer'
import { Readable } from 'stream';
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config();
const { HOST, PORT, OPENAI_API_KEY, TTSKEY } = process.env

const clientPath = path.resolve(__dirname, '../client/dist')

const openai = new OpenAI();
const eleven = new ElevenLabs(
  {
    apiKey: TTSKEY,
    voiceId: 'DVYO7ONqCgr4Bp6CHC1c',
    //Knightly: PcDnPecxCbv82eDtxjXe, Guðrún: DVYO7ONqCgr4Bp6CHC1c
  }
);


const corsOptions = {
  origin: `http://${HOST}:${PORT}`,
  methods: ['GET', 'POST'],
}
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })



const postRoutes = require('./routes/postRoutes')
import { Sound, Post, User, AIMessage, SharedPost } from './dbmodels'


const app = express()
const session = require('express-session');
const crypto = require('crypto');
const passport = require('passport');
require('./auth');
const secret = crypto.randomBytes(64).toString('hex'); //secret hash for session
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
app.use(cors())

app.use(cookieParser(secret, { sameSite: 'strict' }))
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

app.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/protected/feed/following',
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
    const results = await User.findOne({ where: { googleId: req.user } })
    if (results) {
      //console.log('current user:', results)
      res.status(200).send(results);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Error fetching user');
  }
})

app.post('/createPostRecord', async (req, res) => {
  //console.log(req.body);
  try {
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
  } catch (error) {
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
    const airesp = await axios.post('https://api.openai.com/v1/chat/completions',
      request,
      { headers: headers });
    const responseText = airesp.data.choices[0].message.content;
    res.status(200).send({ response: responseText });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


io.on('connection', (socket) => {
  console.log('User connected');


  socket.on('sendUser', (user) => {
    console.log('sockus', user)
    io.emit('recieveUser', user)
  })

  socket.on('sent-shared-message', async (response) => {
    //console.log('socket new-message', response)
    const { sentToId, sentFromId } = response;
    try {
      console.log('sent shared message')
      const sharedPosts = await SharedPost.findAll({
        where: {
          sentToId,
          hasSeen: false
        }
      })
      socket.emit('sharedPost-notification', { sentToId, notificationAmt: sharedPosts.length })

    } catch (error) {
      console.error('shared message socket error', error)
    }
  })
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const speech = new textToSpeech.TextToSpeechClient({
  keyFilename: './key.json',
  projectId: 'whspr-406622'
})

app.post('/text-to-speech-google', async (req, res) => {
  try {
    const text = req.body.text
    const request = {
      input: { text: text },
      voice: { languageCode: 'en-US', ssmlGender: protos.google.cloud.texttospeech.v1.SsmlVoiceGender.NEUTRAL },
      audioConfig: { audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3 }
    }
    const [response] = await speech.synthesizeSpeech(request)
    res.status(200).send(response.audioContent)
  } catch (error) {
    console.error('error in text to speech: ', error)
    res.status(500).send('Error synthesizing speech')
  }
})

app.post('/text-to-speech-openai', async (req, res) => {
  const text = req.body.text
  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      input: text,
      voice: "fable"
    })
    const buffer = Buffer.from(await response.arrayBuffer())
    res.status(200).send(buffer)
  } catch (error) {
    console.error('error in text to speech: ', error)
    res.status(500).send('Error synthesizing speech from open AI')
  }
})

app.post('/text-to-speech-elevenlabs', async (req, res) => {
  const text = req.body.text
  try {
    const stream = await eleven.textToSpeechStream({ textInput: text, responseType: 'stream' })
    res.setHeader('Content-Type', 'audio/mpeg')
    stream.pipe(res)
  } catch (error) {
    console.error('error in text to speech: ', error)
    res.status(500).send('Error synthesizing speech from open AI')
  }
})


app.post('/createRecordsAIMessages', async (req, res) => {
  const { newUserMessage, newAIMessage, userId } = req.body
  try {
    const newUserMessageRecord = await AIMessage.create({
      userId: userId,
      message: newUserMessage,
      role: 'user'
    })
    const newAImessageRecord = await AIMessage.create({
      userId: userId,
      message: newAIMessage,
      role: 'assistant'
    })
    res.status(200).send({ user: newUserMessageRecord, ai: newAImessageRecord })
  } catch (error) {
    console.error('error in AIMessage record creation: ', error)
    res.status(500).send('Error creating record in AIMessages')
  }
})

app.get('/retrieveRecordsAIMessages', async (req, res) => {
  const { userId, nMessages } = req.query
  try {
    if (typeof userId === 'string' && typeof nMessages === 'string') {
      const nMessagesNumber = parseFloat(nMessages)
      const userIdNumber = parseFloat(userId)

      const latestAIMessages = await AIMessage.findAll({
        where: { userId: userIdNumber, role: 'assistant' },
        limit: nMessagesNumber,
        order: [['createdAt', 'DESC']]
      })
      const latestUserMessages = await AIMessage.findAll({
        where: { userId: userIdNumber, role: 'user' },
        limit: nMessagesNumber,
        order: [['createdAt', 'DESC']]
      })
      res.status(200).send({ latestAIMessages: latestAIMessages, latestUserMessages: latestUserMessages })
    } else {
      console.log('not strings')
    }
  } catch (error) {
    console.error('error in AIMessage retrieval: ', error)
    res.status(500).send('Error retrieving record in AIMessages')
  }
})

const writeFileAsync = promisify(fs.writeFile)

app.post('/speechToTextOpenAI', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Empty file in request')
  }
  const tempDir = path.join(__dirname, 'temp')
  fs.mkdirSync(tempDir, { recursive: true })
  const temp = path.join(__dirname, 'temp', `${v4()}.wav`)

  try {
    await writeFileAsync(temp, req.file.buffer)
    const response = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: fs.createReadStream(temp),
      response_format: "text"
    })
    res.send(response)
    fs.unlink(temp, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });
  } catch (error) {
    console.error('error in speechToTextOpenAI', error)
    fs.unlink(temp, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });
  }

})

app.patch('/update-username', async (req, res) => {
  const { displayUsername, userId } = req.body;

  try {
    const userExists = await User.findOne({ where: { displayUsername } });
    if (userExists) {
      return res.status(400).send('Display username already exists');
    }
    await User.update({ displayUsername }, { where: { id: userId } });
    res.status(200).send('User display name updated successfully');
  } catch (error) {
    console.error('Error updating user display name:', error);
    res.status(500).send('Error updating user display name');
  }
});

app.patch('/update-bio', async (req, res) => {
  const { userBio, userId } = req.body;
  try {
    await User.update({ userBio }, { where: { id: userId } });
    res.status(200).send('User bio updated successfully');
  } catch (error) {
    console.error('Error updating user bio:', error);
    res.status(500).send('Error updating user bio');
  }
});

// MAKE SURE THIS IS LAST
app.get('/*', (req: Request, res: Response) => {
  res.sendFile(path.join(clientPath, 'index.html'))
})

export default server
