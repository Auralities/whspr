import React, { useState, useRef } from 'react';
import AudioTag from './AudioTag';
import axios from 'axios';
import { Container, Button, Stack, Card } from 'react-bootstrap';

interface Props {
  audioContext: AudioContext;
  mediaDest: MediaStreamAudioDestinationNode;
  finalDest: AudioDestinationNode
  start: () => void;
  stop: () => void;
  userId: number
}

const RecordSynth = ({ audioContext, finalDest, mediaDest, start, stop, userId }: Props) => {
  const [audioSource, setAudioSource] = useState<string>('');
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const recorder: MediaRecorder = new MediaRecorder(mediaDest.stream);

  // start the sound/recording
  const startRecording = async () => {
    try {
      recorder.ondataavailable = event => {
        setAudioChunks((prevChunks) => [...prevChunks, event.data])
      };
      recorder.start();
      start();
    } catch(error) {
      console.error('Could not start recording', error)
    }
  };

  // stop the sound/recording
  const stopRecording = async () => {
    try {
      stop();
      recorder.stop();
      recorder.onstop = async () => {
        let blob: string = URL.createObjectURL(new Blob(audioChunks, {type: 'audio/wav'}));
        setAudioSource(blob.slice(5));
      };
      console.log('in stopRecording', audioSource);
    } catch(error) {
      console.error('Could not stop recording', error);
    }
  };

  const saveRecording = async () => {
    const saveBlob: Blob = new Blob(audioChunks, {type: 'audio/wav'})
    try {
      const formData = new FormData()
      formData.append('audio', saveBlob)
      formData.append('userId', userId.toString())
      formData.append('title', 'My music')
      formData.append('category', 'music')
      const response = await axios.post(`/upload`, formData);
      console.log('cloud response', response)
      if(response.status === 200){
        console.log('Synth saved to cloud')
      }else{
        console.error('Error saving synth', response.statusText)
      }
    } catch(error) {
      console.error('Error saving audio', error);
    }
  };

  return (
    <Container className="text-center my-3 pb-3">
      <h3 className="mb-2">Record the synth</h3>
      <Stack direction="horizontal" gap={4} className="mx-5 mb-3 typeCard">
        <Button className="btn-secondary" variant="secondary" onClick={start}>▶️</Button>
        <Button className="btn-secondary" onClick={stop}>⏸️</Button>
        <Button className="btn-secondary" onClick={startRecording}>🔴</Button>
        <Button className="btn-secondary" onClick={stopRecording}>🟥</Button>
        <Button className="btn-secondary" onClick={saveRecording}>🎶 </Button>
      </Stack>
    </Container>
  );
};

export default RecordSynth;