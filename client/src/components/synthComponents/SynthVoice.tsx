import React, { useRef, useState, useEffect } from 'react';
import { Stack, Button, Container } from 'react-bootstrap';
import PostSynth from './PostSynth';
import * as Tone from 'tone';

interface Props {
  audioContext: AudioContext;
  userId: any
  robot: any
  wobbly: any
  alien: any
  defaultSettings: {
    lowPassFrequency: number
    highPassFrequency: number
    lowPassType: any // these need to be refactored to the proper types
    highPassType: any
  }
  notes1: string[]
  sampleSynth: any
}

interface Constraints {
  audio: {
    noiseSuppression: boolean,
    echoCancellation: boolean
  }
  video: boolean
}

const SynthVoice = ({ notes1, sampleSynth, audioContext, userId, robot, wobbly, alien, defaultSettings }: Props) => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const audio = useRef<AudioBufferSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const destination: MediaStreamAudioDestinationNode = audioContext.createMediaStreamDestination();
  const [ filter, setFilter ] = useState(defaultSettings);
  const [ addSynth, setAddSynth ] = useState(false);
  const [bgColor, setBgColor] = useState('secondary')

  useEffect(() => {
    setAddSynth(false);
  },[])

  const lowpass: BiquadFilterNode = audioContext.createBiquadFilter();
  lowpass.frequency.value = filter.lowPassFrequency;
  lowpass.type = filter.lowPassType;

  const highpass: BiquadFilterNode = audioContext.createBiquadFilter();
  highpass.frequency.value = filter.highPassFrequency;
  highpass.type = filter.highPassType;

  const constraints: Constraints = {
    audio: {
      noiseSuppression: true,
      echoCancellation: true
    },
    video: false
  }

  
  const startRecording = async () => {
    try {
      setAudioChunks([]);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaRecorder.current = new MediaRecorder(destination.stream);
      const source = audioContext.createMediaStreamSource(stream);
      const poly: Tone.PolySynth = new Tone.PolySynth(Tone.Synth).toDestination();
      if (addSynth) {
        poly.volume.value = -2;
        poly.connect(lowpass).connect(destination);
        poly.triggerAttack(['C#3', 'F3', 'C3'], 3);
      }
      if (filter !== defaultSettings) {
        let options: any = Object.values(filter).slice(4)
        source.connect(lowpass)
        lowpass.connect(highpass)
        highpass.connect(options[0])
        options[0].connect(options[1])
        options[1].connect(options[2])
        options[2].connect(destination);
      } else { source.connect(destination) }
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prevChunks) => [...prevChunks, event.data]);
        }
      }
      mediaRecorder.current.onstop = () => {
        poly.disconnect()
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = async (): Promise<void> => {
    if ((audioChunks.length === 0) || !audioContext) {
      console.error('something was null: ', audioChunks.length === 0, !audioContext)
      return;
    }
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
    const arrayBuffer = await audioBlob.arrayBuffer()
    audioContext.decodeAudioData(
      arrayBuffer,
      (buffer) => {
        if (!audioContext) {
          console.error('audio context is null')
          return
        }
        audio.current = audioContext.createBufferSource()
        audio.current.buffer = buffer
        audio.current.connect(audioContext.destination);
        audio.current.onended = () => {
          setIsPlaying(false)
        }
        audio.current.start()
        setIsPlaying(true)
      },
      (error) => {
        console.error('error playing audio: ', error)
      }
    ).catch((playError) => {
      console.error('error playing: ', playError)
    })
  }

  const stopPlaying = () => {
    if (audio.current) {
      audio.current.stop();
      setIsPlaying(false);
    }
  };

  const emptyRecording = () => {
    setAudioChunks([])
  };

    // POLISHING FOR EACH BUTTON
  // const filterSetter = (filter: any) => {
  //   setFilter(filter);
  //   bgColor === 'secondary' ? setBgColor('danger') : setBgColor('secondary');
  // };

  return (
    <Container className="text-center my-3 pb-1">
      <h5>Try out our new voice filters!</h5>
      <PostSynth isRecording={isRecording} audioChunks={audioChunks} userId={userId} />
      <Stack direction="horizontal" className="mx-5 mb-3 typeCard">
        <Button className="mx-2 btn-secondary" disabled={filter === defaultSettings} onClick={() => setFilter(defaultSettings)}>Default</Button>
        <Button className="mx-2 btn-secondary" disabled={filter === alien} onClick={() => setFilter(alien)}>Alien</Button>
        <Button className="mx-2 btn-secondary" disabled={filter === wobbly} onClick={() => setFilter(wobbly)}>Wobbly</Button>
        <Button className="mx-2 btn-secondary" disabled={filter === robot} onClick={() => setFilter(robot)}>Robot</Button>
        <Button className="mx-2" variant={bgColor} onClick={() => {
          addSynth === false ? setAddSynth(true) : setAddSynth(false);
          bgColor === 'secondary' ? setBgColor('danger') : setBgColor('secondary');
          }}>Synth/Voice</Button>
      </Stack>
      <Stack direction="horizontal" className="mx-5 mb-3 typeCard">
      <button className="record-button mx-2" onClick={startRecording} disabled={isRecording}><img src={require('../../style/recordbutton.png')} /></button>
      <button className="play-button mx-2" onClick={playAudio} disabled={isPlaying || audioChunks.length === 0 }><img src={require('../../style/playbutton.png')} /></button>
      <button className="stop-button mx-2" onClick={isRecording ? stopRecording : stopPlaying} disabled={!isRecording && !isPlaying}><img src={require('../../style/stopbutton.png')} /></button>
      <button className="delete-button mx-2" onClick={emptyRecording} disabled={audioChunks.length === 0 || isRecording}><img src={require('../../style/deletebutton.png')} /></button>
      </Stack>
    </Container>
  );
};

export default SynthVoice;