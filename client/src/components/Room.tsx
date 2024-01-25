import React, { ChangeEventHandler, MutableRefObject, useEffect, useRef, useState } from 'react';
import {useParams} from 'react-router-dom'
import Peer from 'peerjs';
import AgoraRTC from 'agora-rtc-sdk';
// import agoraConfig from '../agoraConfig'
import AudioAnalyser from './Analyser'
import { joinChannel, leaveChannel, startAudio, stopAudio, createChannel, subscribeRemoteUser } from './AgoraClient';
import { useLoaderData, useNavigate } from 'react-router-dom';
import axios from 'axios'
import socket from './socket'
import RoomUser from './RoomUser'



const Room = ({  host, id,  audioContext }) => {
  
  const {name} = useParams()
  const [channelName, setChannelName] = useState("a");
  const [channel, setChannel] = useState<string>()
  const [uid, setUid] = useState<number>();
  const [stream, setStream] = useState<MediaStream>();
  const [remoteAudioTracks, setRemoteAudioTracks] = useState<string[]>([]);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const [mute, setMute] = useState<boolean>(false)
  const [listeners, setListeners] = useState<any>([])
  const [owner, setOwner] = useState<any>()
  const navigate = useNavigate()
  const user: any = useLoaderData();

  
  useEffect(() => {
    setRoomProps()
    const initUserMedia = async () => {
      try {
        setChannel(name)
        console.log('channel', channel, owner)
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        setStream(userMediaStream);
        
        if (user.username !== owner) {
          //setListeners([...listeners, user]);
        }
        socket.emit('sendUser', {user: user, stream: userMediaStream})
        socket.on('recieveUser', (user) => {
          console.log('list', owner, user)
          if(listeners !== undefined && listeners.length > 0 && user.username !== owner.username){
            setListeners((prevListeners) => [...prevListeners, user])
            
          }else{
            setListeners([user])
            console.log('zero', listeners)
          }
        })
        createChannel(channelName, uid, '007eJxTYDj5/8Lv9x+/XNp3M/a/jcOcfNPri/j3v/x7/MWE+aeO5h5eqMCQaJyUbGBimmhhZmlhYmFubmGUYpBqZphkbGpmYWlpanR586bUhkBGBja7KyyMDBAI4jMyJDIwAAD9kCQ+', userMediaStream);
      } catch (error) {
        console.log('Error initializing user media:', error);
      }
    };
    
    initUserMedia();
    
    subscribeRemoteUser((user, mediaType) => {
      if (mediaType === 'audio') {
        const remoteAudioTrack = user.audioTrack;
        user.audioTrack.play();
        setRemoteAudioTracks((prevTracks) => [...prevTracks, remoteAudioTrack]);
        
        remoteAudioRef.current = remoteAudioTrack;
      }
    });

    
  }, [audioContext]);
  
  const setRoomProps = async () => {
    try{
    
      const info = await axios.get(`/post/radio/${name}`)
      const ost = info.data[0].host
      const hosts = await axios.get(`/post/user/${ost}`)
      console.log('info', info, hosts)
      setChannel(info.data[0].title)
      setUid(info.data[0].id)
      setOwner(hosts.data[0])

    }catch{
      console.log('no')
    }
  }

  const handleJoinChannel = (stream) => {
    joinChannel(channelName, uid, '007eJxTYDj5/8Lv9x+/XNp3M/a/jcOcfNPri/j3v/x7/MWE+aeO5h5eqMCQaJyUbGBimmhhZmlhYmFubmGUYpBqZphkbGpmYWlpanR586bUhkBGBja7KyyMDBAI4jMyJDIwAAD9kCQ+');
    startAudio();
  };

  const muted = () => {
    setMute(!mute)
    stopAudio();

  }

  const handleLeaveChannel = (stream) => {
    leaveChannel();
    //console.log('stream', stream);
    stopAudio();
    if(user.username === owner.username){
      axios.delete(`/post/radio/${user.username}`)
      .then(() => {
        console.log('done')
      }).catch(() => {
        console.log('uhh')
      })
    }
    window.location.href = '/protected/radio'
  };
  
  return (
    
    <div>
      <div style={{justifyContent: 'right', flexDirection: 'row', display: 'flex', alignItems: 'right'}}>

      <img
            onClick={handleLeaveChannel}
            src={require('../style/icons8-leave-32.png')}
            style={{width: '50px', margin: '20px', justifyContent: 'right'}}
          />
      </div>

    <div style={{ alignItems: 'center'}} className='container'>
   
      <h1 style={{color: 'white'}}>{channel}</h1>

      
      <div className='card'>

      <audio ref={remoteAudioRef} autoPlay />


       
       <div className='room-info'>
       {owner ? <img className="rounded-circle"
                    style={{
                      width: 'auto',
                      height: '100px',
                      marginTop:  '40px',
                      marginLeft: '40px',
                      objectFit: 'scale-down',
                      borderStyle: 'solid',
                      borderWidth: 'medium',
                      borderColor: '#3C3556',
                    }}  src={owner.profileImgUrl} alt="user profile image" />
       :
          <img style={{marginLeft: '15px', marginTop: '15px'}} width="100" src="https://lh3.googleusercontent.com/a/ACg8ocI6UOrLKNPeKzMpAobwFfMo2jVBc2SccK66hzTPMkEk=s96-c" alt="user profile image" />
       }
          <AudioAnalyser audioContext={audioContext} audioStream={stream}/>
         
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
      
      <br />
     
      </div>

      <div style={{ marginTop: '20px',  alignItems: 'center'}} className='container'>

        
          <div>
            { listeners ?
            listeners.map((listener) => {
              return (
                <div>
                  {listener.user.username !== owner.username ? 
                  <RoomUser image={listener.user.profileImgUrl} audioStream={listener.stream} audioContext={audioContext} muted={muted}/>
                  : <br/>
                  }
                  </div>
              )
            
        
      }) : <br></br>
    }

          
        </div>

        
      </div>

      
    </div>
    </div>
  );
};

export default Room;