import React from 'react';
import { Container, Button, Stack, Card } from 'react-bootstrap';

interface Props {
  oscSettings: {
    frequency: number,
    detune: number,
    type: string
  };
  changeType: (e: any) => void;
  changeValue: (e: any) => void;
}

const Oscillator = ({oscSettings, changeType, changeValue}: Props): React.JSX.Element => {
  const { type, frequency, detune } = oscSettings;

  return (
    <Container className="">
        <h5 className="text-center">Select wave type</h5>
        <Stack direction="horizontal" gap={2} className="mx-5 mb-3 typeCard">
          <Button className={`${type === 'sine' && 'active'}`} variant="secondary" id="sine" onClick={changeType}>
            Sine
          </Button>
          <Button className={`${type === 'triangle' && 'active'}`} variant="secondary" id="triangle" onClick={changeType}>
            Triangle
          </Button>
          <Button className={`${type === 'square' && 'active'}`} variant="secondary" id="square" onClick={changeType}>
            Square
          </Button>
          <Button className={`${type === 'sawtooth' && 'active'}`} variant="secondary" id="sawtooth" onClick={changeType}>
            Sawtooth
          </Button>
        </Stack>
        <Stack direction="horizontal" className="typeCard mb-2">
          <div className="text-center">
            <h6>Frequency</h6>
            <input value={frequency} max="880"  onChange={changeValue} id="frequency" type="range" />
          </div>
          <div className="text-center">
            <h6>Detune</h6>
            <input  value={detune} max="150" min="-150" onChange={changeValue} id="detune" type="range" />
          </div>
        </Stack>
    </Container>
  );
};

export default Oscillator;