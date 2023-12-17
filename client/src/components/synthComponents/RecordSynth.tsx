import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Container, Button, Stack, Card } from 'react-bootstrap';

interface Props {
  audioContext: AudioContext;
  mediaDest: MediaStreamAudioDestinationNode;
  finalDest: AudioDestinationNode
  start: () => void;
  stop: () => void;
  userId: number
  title: string
}

const RecordSynth = ({ title, audioContext, finalDest, mediaDest, start, stop, userId }: Props) => {
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const recorder = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      recorder.current = new MediaRecorder(mediaDest.stream);
      recorder.current.ondataavailable = event => {
        if (event.data.size > 0) {
          setAudioChunks((prevChunks) => [...prevChunks, event.data])
        }
      };
      recorder.current.start();
      start();
    } catch(error) {
      console.error('Could not start recording', error)
    }
  };

  const stopRecording = async () => {
    try {
      if (recorder.current?.state === 'recording') {
        stop();
        recorder.current.stop();
      }
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
      formData.append('title', title)
      formData.append('category', 'music')
      const response = await axios.post(`/upload`, formData);
      response.status === 200
      ?
      console.log('Synth saved to cloud')
      :
      console.error('Error saving synth', response.statusText);
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