import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import { useLoaderData } from 'react-router-dom';
import Post from './Post';
import WaveSurferComponent from './WaveSurfer';
const ReadOnlyProfile = ({audioContext}) => {
    const [selectedUserInfo, setSelectedUserInfo] = useState<any>()
    const [following, setFollowing] = useState<boolean>(false)
    const [onProfile, setOnProfile] =useState<boolean>(true)

    //const [userPosts, setUserPosts]  = useState<any>()
    const { id } = useParams();
    const user:any = useLoaderData()
    const getSelectedUserInfo = async () => {
      try{
        const selectedUserObj = await axios.get(`/post/selected/${id}`)
        setSelectedUserInfo(selectedUserObj.data)
        // setUserPosts(selectedUserObj.data[0].Posts)
        // console.log(selectedUserObj.data[0].Posts)
      }catch(error){
        console.error('could not get selected user info', error)
      }
    }
    const updatePost = async(postId, updateType) => {
      try{
          const updatedPost:any = await axios.get(`/post/updatedPost/${postId}/${user.id}`)
          console.log('updated post obj', updatedPost)
          const postIndex = selectedUserInfo.findIndex((post) => post.id === updatedPost.data.id)
          updatedPost.data.rank = selectedUserInfo[postIndex].rank
          //console.log('post index', updatePostIndex)
          const postsWUpdatedPost = selectedUserInfo.toSpliced(postIndex, 1, updatedPost.data )
          console.log(postsWUpdatedPost)
          setSelectedUserInfo(postsWUpdatedPost)
      } catch(error){
          console.log('could not update post', error)
      }
  }
    const startFollowing = async () => {
      try{
        const createFollowing = await axios.post('/post/startFollowing', {userId: user.id, followingId:id})
        if(createFollowing.data === 'Created'){
          setFollowing(true)
        }
      }catch(error){
        console.error('could not follow user', error)

      }
    }

    const stopFollowing = async () => {
      try{
        const createFollowing = await axios.delete(`/post/stopFollowing/${user.id}/${id}`)
        if(createFollowing.data === 'Created'){
          setFollowing(false)
        }
      }catch(error){
        console.error('could not follow user', error)

      }
    }

    const isFollowing = async () => {
      try{
        const findFollowing = await axios.get(`/post/isFollowing/${user.id}/${id}`)
        if(findFollowing.status === 200){
          setFollowing(true)
        }
      }catch(error: any){
        if(error.response.status === 404){
          setFollowing(false)
        }
        console.log('following error', error)
      }
    }
    useEffect(() => {
      getSelectedUserInfo()
      isFollowing()
    }, [])
    return (
        <div className="user-main">
           {selectedUserInfo ? 
          <div>
            <div className="user-profile-card">
                <div className="user-profile-image">
                    <img 
                    style={{ width: 'auto', height: '100px', objectFit: 'scale-down' }}
                    src={selectedUserInfo[0].user.profileImgUrl} alt="user profile image" />
                </div>
                <div className="user-profile-info">
                  <h2 style={{color: 'white'}}>{selectedUserInfo[0].user.username}</h2>
                </div>
                {following ? 
                <button
                className='btn btn-light'
                onClick={() => stopFollowing()}
                >Unfollow</button>
                : <button
                className='btn btn-light'
                onClick={() => startFollowing()}
                >Follow</button>}
            </div>
            <div>
              {selectedUserInfo.map((post) => (
                <div>
                <WaveSurferComponent
                postObj={post}
                audioUrl={post.soundUrl}
                postId={post.id}
                userId={user.id}
                getPosts={getSelectedUserInfo}
                onProfile={onProfile}
                updatePost={updatePost}
                setOnProfile={setOnProfile}
                />
                <Post
                  key = {post.id}
                  postObj = {post}
                  audioContext={audioContext}
                  updatePost={updatePost}
                  user={user}
                />
                {/* each post should have its own instance of a waveSurfer comp */}
      
              </div>
              )) }
            </div>
            </div>
            : <div>Loading...</div>}
        </div>
    )
};

export default ReadOnlyProfile;