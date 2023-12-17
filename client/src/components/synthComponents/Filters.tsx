import React from 'react';
import Tuna from 'tunajs';
import SynthVoice from './SynthVoice';
import * as Tone from 'tone';

interface Props {
  audioContext: AudioContext
  userId: any
  title: string
}

const Filters = ({ audioContext, userId }: Props) => {
  const tuna = new Tuna(audioContext);
  Tone.setContext(audioContext);
  console.log(audioContext, Tone.context);

  const defaultSettings = {
    lowPassFrequency: 350,
    highPassFrequency: 350,
    highPassType: 'highpass',
    lowPassType: 'lowpass',
  }

  const robot = {
    lowPassType: 'lowpass',
    lowPassFrequency: 60,
    highPassType: 'highpass',
    highPassFrequency: 5000,
    chorus: new tuna.Chorus({
      rate: 5,
      feedback: 0.45,
      delay: 0.6,
      bypass: false,
    }),
    compressor: new tuna.Compressor({
      threshold: -100,
      makeupGain: 7,
      attack: 5,
      release: 500,
      ratio: 9,
      knee: 36,
      automakeup: false,
      bypass: false
    }),
    gain: new tuna.Gain({ gain: 90 })
  };

  const wobbly = {
    lowPassType: 'lowpass',
    lowPassFrequency: 150,
    highPassType: 'highpass',
    highPassFrequency: 6000,
    wahwah: new tuna.WahWah({
      automode: true,
      baseFrequency: 0.2,
      excursionOctaves: 6,
      sweep: 0.35,
      resonance: 36,
      sensitivity: -0.3,
      bypass: false
    }),
    pingPongDelay: new tuna.PingPongDelay({
      wetLevel: 0.6,
      feedback: 0.7,
      delayTimeLeft: 60,
      delayTimeRight: 100,
    }),
    gain: new tuna.Gain({ gain: 250})
  }

  const alien = {
    lowPassType: 'lowpass',
    lowPassFrequency: 50,
    highPassType: 'highpass',
    highPassFrequency: 7000,
    gain: new tuna.Gain({ gain: 150 }),
    compressor: new tuna.Compressor({
      threshold: -80,
      makeupGain: 20,
      attack: 1,
      release: 250,
      ratio: 4,
      knee: 5,
      automakeup: false,
      bypass: false
    }),
    phaser: new tuna.Phaser({
      rate: 23,
      depth: 0.4,
      feedback: 0.6,
      stereoPhase: 20,
      baseModulationFrequency: 1000,
      bypass: false
    }),
  }

  const notes1: string[] = ['G#4', 'E4', 'G#4', 'A#4', 'B4', 'A#4', 'G#4', 'E4', 'D#4'];
  const sampleSynth = new Tone.MonoSynth();

  return (
    <div>
      <SynthVoice
        sampleSynth={sampleSynth}
        notes1={notes1}
        audioContext={audioContext}
        userId={userId}
        robot={robot}
        wobbly={wobbly}
        alien={alien}
        defaultSettings={defaultSettings} />
    </div>
  );
};

export default Filters;