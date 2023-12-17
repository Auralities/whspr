import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
// import {audioContext} from './App'

export const WhsprAI = ({audioContext}) => {
    const [isRecording, setIsRecording] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [text, setText] = useState<string[]>([])
    const [AIResponse, setAIResponse] = useState<string[]>([])
    const [lengthTracker, setLengthTracker] = useState(0)
    const [AISpeech, setAISpeech] = useState<Blob | null>(null)
    const [animationInitialized, setAnimationInitialized] = useState(false);
    const canvasRef = useRef(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const frameRef = useRef<number | null>(null);
    const analyserRef = useRef<AnalyserNode|null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

//sets up an analyser for the computer's audio
    const setupAnalyser = (audio) => {
        if (!audioContext) {
            console.error('AudioContext or audio source is not available.');
            return;
        }
        try{
            if (!sourceRef.current) {
                sourceRef.current = audioContext.createMediaElementSource(audio);
            }
            const analyser = audioContext.createAnalyser();
            sourceRef.current.connect(analyser);
            analyser.connect(audioContext.destination);
            analyser.fftSize = 2048;
            analyserRef.current = analyser;
        }catch(error){
            console.error('error setting up analyser:', error)
        }
    };

// browser speech recognition
    useEffect(() =>{
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            const recognize = new SpeechRecognition()
            recognize.continuous = true;
            recognize.onresult = (e) =>{
            let currentText = ''
            for (let i = e.resultIndex; i < e.results.length; ++i) {
                if (e.results[i].isFinal) {
                    currentText = e.results[i][0].transcript;
                    setText(prevText => [...prevText, currentText]);
        
        }
    }
}
//starts the recording and hooks it up to the analyzer so mic sounds are also drawn
const startRecording = async() =>{
    try{
        const stream = await navigator.mediaDevices.getUserMedia({audio: true})
        mediaStreamRef.current = stream
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 2048;
        const audio = audioContext.createMediaStreamSource(stream);        
        audio.connect(analyserRef.current);
        drawAudio();
    }catch(error){console.error('error starting recording:', error)}
}

//fires start recording and speech recognition when is recording is true
if(isRecording){
    recognize.start();        
    startRecording();
}else{
    if(sourceRef.current){
        sourceRef.current = null
    }
    if(frameRef.current){
    cancelAnimationFrame(frameRef.current);
    }
}
    return () => {
        if(recognize){
            recognize.stop()
        }
        if (mediaStreamRef.current) {
            const tracks = mediaStreamRef.current.getTracks();
            tracks.forEach(track => track.stop());
            mediaStreamRef.current = null;
            }
        }
    }, [isRecording])
//creates an analyser
useEffect(() =>{
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048
    analyserRef.current = analyser
}, [audioContext])
//animation draws the audio
    const drawAudio = () =>{
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        
        if (!canvas || !analyser) return;
            const context = canvas.getContext('2d')
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            const drawFrame = () =>{
                frameRef.current = requestAnimationFrame(drawFrame)
                analyser.getByteTimeDomainData(dataArray)
                context.clearRect(0, 0, canvas.width, canvas.height)
                context.lineWidth = 1;
                context.strokeStyle = 'rgb(4, 217, 255)'
                context.shadowBlur = 15;
                context.shadowColor = "white"
                

            let sliceWidth = canvas.width * 1 / bufferLength
            let x = 0;
                
                context.beginPath();
            for (let i = 0; i < bufferLength; i++){
                let v = dataArray[i] / 128;
                let y = v * canvas.height / 2;

                if(i === 0){
                    context.moveTo(x, y);
                }else{
                    context.lineTo(x, y);
                }
                x += sliceWidth;
            }
            context.lineTo(canvas.width, canvas.height / 2)
            context.stroke();
        }

        drawFrame();
    } 
//gets the bowser based voices and speaks them
    const browserTextToSpeech = async (responseString, voiceName) => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
            await new Promise<void>(resolve => {
                const voicesChanged = () => {
                    voices = window.speechSynthesis.getVoices();
                    resolve();
                    window.speechSynthesis.onvoiceschanged = null;
                };
                window.speechSynthesis.onvoiceschanged = voicesChanged;
            });
        }
        const utterance = new SpeechSynthesisUtterance(responseString);
        const selectedVoice = voices.find(voice => voice.name === voiceName);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        } else {
            console.warn('Selected voice not found, using default voice');
        }
        window.speechSynthesis.speak(utterance);
    };

//////////////////////////////gets ai generated text and speaks it
const playAudio = (buffer) => {
    const array = new Uint8Array(buffer)
    const blob = new Blob([array], {type: "audio/mpeg"})
    const blobUrl = URL.createObjectURL(blob)
    const audio = new Audio()
    audio.src = blobUrl;
    setupAnalyser(audio);
    drawAudio();
    audio.addEventListener('ended', () =>{
        if(sourceRef.current){
            sourceRef.current = null
        }
        if(frameRef.current){
            cancelAnimationFrame(frameRef.current);
        }
    })
    audio.play()
};

//this voice variable controls which endpoint is used for the tts
const VOICE = 'openai'
const getAIResponse = async () =>{
    if(text.length === 0){return}
    let messages = [{ role: "system", content: "You are an old friend named Whisper." }]
    const lastFive = arr => arr.length > 5 ? arr.slice(-5) : arr
    const userMessages = lastFive(text);
    const aiMessages = lastFive(AIResponse);
    for(let i = 0; i < userMessages.length; i++){
        messages.push({"role": "user", "content": `Respond using a 100 completion_tokens or less: ${userMessages[i]}`})
        if(aiMessages[i]){
            messages.push({"role": "assistant", "content": aiMessages[i]})
        }
    }
    try{
        const resp = await axios.post('/openAIGetResponse', {messages: messages})
        setAIResponse(prevResponses => [...prevResponses, resp.data.response])
        if(VOICE === 'browser'){
            browserTextToSpeech(resp.data.response, 
            "Microsoft Zira - English (United States)")
        }else if(VOICE === 'google'){
            const spokenResponse = await axios.post('/text-to-speech-google', {text: resp.data.response}, { responseType: 'arraybuffer' })
            playAudio(spokenResponse.data)
            }else if(VOICE === 'openai'){
                const spokenResponse = await axios.post('/text-to-speech-openai', {text: resp.data.response}, { responseType: 'arraybuffer' })
                playAudio(spokenResponse.data)
            }else if(VOICE === 'elevenlabs'){
                const spokenResponse = await axios.post('/text-to-speech-elevenlabs', {text: resp.data.response}, { responseType: 'arraybuffer' })
                playAudio(spokenResponse.data)
            }else{return}
            setIsLoading(false)
        }catch (error){
        console.error("Error getting response from AI in getAIResponse: ", error)
    }
}

//cleans up animation
useEffect(() => {
    return () => {
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
        }
    };
}, []);
//send ai question
useEffect(() =>{
    if(!isRecording && text.length > lengthTracker){
        setIsLoading(true)
        getAIResponse()
        setLengthTracker(text.length)
    }
}, [isRecording, text])

//starts the audio context
function startUserMedia(){
   if(!audioContext){
    audioContext = new AudioContext;
}
audioContext.resume()
}

//sets canvas width to the whole screen
useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
    }
    window.addEventListener('resize', handleResize)
    return
    
  }, []);
const handleResize = () =>{
if(canvasRef.current){
    canvasRef.current.width = window.innerWidth;
    initializeAnimation()
}
}
//starts and stops the animation so that a line appears on the screen
const initializeAnimation = () =>{
    if (!animationInitialized) {
        setTimeout(() =>{
          drawAudio();
          if(frameRef.current){
              cancelAnimationFrame(frameRef.current)
          }
      }, 0)
      setAnimationInitialized(true);
      }
}
//fires initialize animation on pageload
useEffect(() => {
initializeAnimation()
  }, [animationInitialized]);


// const blobUrl = AISpeech ? URL.createObjectURL(AISpeech) : null;
// blobUrl ? console.log(blobUrl) : null
  return (
    <div className='container-whsprAI'>
        <div className="centered-whsprAI">
            <div className="canvas-container-whsprAI">
            <canvas ref={canvasRef} width="100vh" height="100" className="mt5"></canvas>
            </div>
        </div>
        <div className="centered-whsprAI">
            {isLoading 
            ? (<img src={require('../style/loading.gif')} 
            className="loading-img"></img>) 
            : (<button 
                onMouseDown={() => {
                    setIsRecording(true)
                    startUserMedia()
                }} 
                onMouseUp={() => setIsRecording(false)} 
                onMouseLeave={() => setIsRecording(false)} 
                className="btn" 
                style={{border: "none"}}>
                {!isRecording 
                ? (<img src={require('../style/presstotalk.png')} 
                className="presstotalk-img"/>) 
                : <img src={require('../style/pressedtotalk.png')} 
                draggable="false" 
                className="presstotalk-img"/>}
                </button>
            )}
        </div>
{/* {blobUrl ? <audio controls src={blobUrl}></audio> : null} */}
{/* {text.map((item, index) => (
    <div key={index}>
                    These display the text generated from user audio and the text recieved from openai for debugging */}
                    {/* <div><span className="text-warning">Interlocutor:</span>{" "}{item}</div> */}
                    {/* {AIResponse[index] && <div><span className="text-warning">The AI: </span>{AIResponse[index]}</div>}
                </div>
            ))} */}
            </div>
  );
}
