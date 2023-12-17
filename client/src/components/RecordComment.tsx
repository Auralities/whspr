import React, { useState, useRef } from 'react'
import { useLoaderData } from 'react-router-dom';
import axios from 'axios'

export const RecordComment = (props, { audioContext }: { audioContext: BaseAudioContext }) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioSource = useRef<AudioBufferSourceNode | null>(null)
  

  const { postObj, getComments, user, updatePost } = props
  const userId = user.id
  const startRecording = async () => {
    try {
      setAudioChunks([])
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prevChunks) => [...prevChunks, event.data])
        }
      }
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
      }
      mediaRecorder.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = async () => {
    if (mediaRecorder?.current?.state === 'recording') {
      mediaRecorder.current.stop()
      setIsRecording(false)
      // stop mic access
      const tracks = mediaRecorder.current.stream.getTracks()
      tracks.forEach((track) => {
        track.stop()
      })
    }
  }

  const playAudio = async (): Promise<void> => {
    if ((audioChunks.length === 0) || !audioContext) {
      console.error('something was null: ', audioChunks.length === 0, !audioContext)
      return
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
        audioSource.current = audioContext.createBufferSource()
        audioSource.current.buffer = buffer
        audioSource.current.connect(audioContext.destination)

        audioSource.current.onended = () => {
          setIsPlaying(false)
        }
        audioSource.current.start()
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
    if (audioSource.current) {
      audioSource.current.stop()
      setIsPlaying(false)
    }
  }

  const emptyRecording = () => {
    setAudioChunks([])
  }

  // const saveAudioToGoogleCloud = async () => {
  //   const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
  //   try {
  //     const formData = new FormData()
  //     formData.append('audio', audioBlob)
  //     const response = await axios.post(`/upload/${user.id}/${postObj.id}`, formData)
  //     if (response.status === 200) {
    //       const downloadURL = response.data
    //       return downloadURL
    //     } else {
      //       console.error('Error saving audio:', response.statusText)
      //     }
      //   } catch (error) {
        //     console.error('Error saving audio:', error)
        //   }
        // }
    const saveAudioToGoogleCloud = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)
      formData.append('userId', userId)
      formData.append('postId', postObj.id)

      const response = await axios.post(`/uploadComment`, formData)
      if (response.status === 200) {
        await axios.put('/post/updateCount', {type: 'increment', column: 'commentCount', id: postObj.id})
        await getComments()
        await updatePost(postObj.id, user.id)
        await console.log('all done')
      } else {
        console.error('Error saving audio:', response.statusText)

      }
    } catch (error) {
      console.error('Error saving audio:', error)
    }
  }
  // const createPostRecord = async () => {
  //   try {
  //     const soundUrl = await saveAudioToGoogleCloud()
  //     const postResponse = await axios.post('/post/createCommentRecord', {
  //       userId: user.id,
  //       postId: postObj.id,
  //       soundUrl
  //     })
  //     if (postResponse.status === 201) {
  //       console.info('Post saved to Database')
  //     } else {
  //       console.error('Error saving post: ', postResponse.statusText)
  //     }
  //   } catch (error) {
  //     console.error('error saving post: ', error)
  //   }
  // }
  
  return (
    <div style={{margin:'15px'}}>
    <button
      className="record-button"
      onClick={startRecording}
      disabled={isRecording}
      ><img src={require('../style/recordbutton.png')} /></button>
      <button
      className="play-button"
      onClick={playAudio}
      disabled={isPlaying || audioChunks.length === 0 }
      ><img src={require('../style/playbutton.png')} /></button>
      <button
      className="stop-button"
      onClick={isRecording ? stopRecording : stopPlaying}
      disabled={!isRecording && !isPlaying}
      ><img src={require('../style/stopbutton.png')} /></button>
      <button
      className="delete-button"
      onClick={emptyRecording}
      disabled={audioChunks.length === 0 || isRecording}
      ><img src={require('../style/deletebutton.png')} /></button>
      <button
      className="post-button"
      onClick={() =>{
        saveAudioToGoogleCloud()
        emptyRecording()
      }}
      disabled={audioChunks.length === 0 || isRecording}
      ><img src={require('../style/postbutton.png')} /></button>
  </div>
  )
}
