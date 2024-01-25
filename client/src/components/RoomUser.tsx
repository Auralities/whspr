import React, {useState, useEffect} from 'react'
import AudioAnalyser from './Analyser'


const RoomUser = ({audioStream, audioContext, image, muted}) => {
    const [mute, setMute] = useState<boolean>(false)
    const [stream, setStream] = useState<MediaStream>();

  useEffect(() => {
    const init = async () => {
      try {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            setStream(userMediaStream)
  
      }catch {
        console.log('no')
      }

    }

    init()
  }, [])
    return (
        <div className='card'>
          <div className='room-users'>

        <img className="rounded-circle"
                    style={{
                      width: 'auto',
                      height: '100px',
                      marginTop:  '40px',
                      marginLeft: '40px',
                      objectFit: 'scale-down',
                      borderStyle: 'solid',
                      borderWidth: 'medium',
                      borderColor: '#3C3556',
                    }}  src={image} alt="user profile image" />

        <AudioAnalyser audioStream={stream} audioContext={audioContext}/>

              {mute ?  <img
            onClick={muted}
            src={require('../style/mute.svg')}
            style={{width: '50px', margin: '20px', justifyContent: 'right'}}
          /> :<img
          onClick={muted}
          src={require('../style/unmute.svg')}
          style={{width: '50px', margin: '20px', justifyContent: 'right'}}
        />}
        </div>
        </div>
    )
}

export default RoomUser