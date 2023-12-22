import React, { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import PostCard from './PostCard';
import Post from './Post';
import WaveSurferComponent from './WaveSurfer';
import { useLoaderData } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

const Feed = ({ audioContext }: { audioContext: BaseAudioContext }) => {
const [posts, setPosts] = useState<any>()
const [feed, setFeed] = useState<string>('explore')
const [title, setTitle] = useState<string>('Explore WHSPR')
const [onProfile, setOnProfile] =useState<boolean>(false)
const [isExplore, setIsExplore] = useState<boolean>(true)
const [isFollowFeed, setIsFollowFeed] = useState<boolean>(false)
const user: any = useLoaderData();
// console.log(user)
const getPosts = async(type, tag) => {
  setFeed(type)
  if(type === 'explore'){
    setIsExplore(true)
    setIsFollowFeed(false)
  } else if(type === 'following'){
    setIsFollowFeed(true)
    setIsExplore(false)
  }
  try{
   // console.log('request variables', type, user.id, tag)
    const allPosts: AxiosResponse = await axios.get(`/post/${type}/${user.id}/${tag}`)
    setPosts(allPosts.data)
    if(tag !== 'none'){
        setTitle(`Explore #${tag}`)
    } else if(type === 'following'){
        setTitle('Explore Posts from your Friends')
    } else {
        setTitle('Explore WHSPR')
    }
    console.log('all posts', allPosts.data)
  } catch(error) {
    console.log('client get friends', error)
  }
}

const updatePost = async(postId, updateType) => {
    try{
        const updatedPost:any = await axios.get(`/post/updatedPost/${postId}/${updateType}`)
        console.log('updated post obj', updatedPost)
        const postIndex = posts.findIndex((post) => post.id === updatedPost.data.id)
        updatedPost.data.rank = posts[postIndex].rank
        //console.log('post index', updatePostIndex)
        const postsWUpdatedPost = posts.toSpliced(postIndex, 1, updatedPost.data )
        console.log(postsWUpdatedPost)
        setPosts(postsWUpdatedPost)
    } catch(error){
        console.log('could not update post', error)
    }
  };
  useEffect(() => {
    getPosts('explore', 'none');
  }, []);

// SYDNEY => these are placeholders passing into PostCard so my added functionality in RecordPost doesn't conflict
// placeholder is a default for synthAudioChunks as either voice or synth is saved
// default settings are the base settings for the filters
  const defaultSettings = {
    lowPassFrequency: 350,
    highPassFrequency: 350,
    highPassType: 'highpass',
    lowPassType: 'lowpass',
  }
  const placeHolder: Blob[] = [];
  return (
    <div>
    <div className="centered">
<PostCard audioContext={audioContext} filter={defaultSettings} synthAudioChunks={placeHolder} />
    </div>
    <h2 style={{ color: 'white' }}>{title}</h2>
    {feed === 'following' ?
    <div>
        <button
        type="button"
        className="btn btn-dark"
        onClick={() => getPosts('following', 'none')}
        >Following</button>
        <button
        type="button"
        className="btn btn-light"
        onClick={() => getPosts('explore', 'none')}
        >Explore</button>
    </div>
      : <div>
      <button
        type="button"
        className="btn btn-light"
        onClick={() => getPosts('following', 'none')}
        >Following</button>
        <button
        type="button"
        className="btn btn-dark"
        onClick={() => getPosts('explore', 'none')}
        >Explore</button>
      </div>}
        {/* {feed === 'explore' ?  */}
      <Nav variant="tabs" style={{margin: '15px'}} >
        <Nav.Item>
            <Nav.Link id='nav' onClick={() => getPosts('explore', 'none')} active={isExplore}>Explore</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link id='nav' onClick={() => getPosts('following', 'none')} active={isFollowFeed}>Following</Nav.Link>
        </Nav.Item>
      </Nav >
    {/* //  : <Nav variant="tabs" >
    //     <Nav.Item>
    //   <Nav.Link onClick={() => getPosts('explore', 'none')} >Explore</Nav.Link>
    //   </Nav.Item>
    //   <Nav.Item>
    //       <Nav.Link onClick={() => getPosts('following', 'none')} active>Following</Nav.Link>
    //   </Nav.Item>
    //       </Nav> 
    //     } */}

      {posts ? posts.map((post: any) => (
        <div style={{marginBottom: '10px'}}>
          <WaveSurferComponent
          postObj={post}
          audioUrl={post.soundUrl}
          postId={post.id}
          userId={user.id}
          getPosts={getPosts}
          updatePost={updatePost}
          audioContext={audioContext}
          feed={feed}
          />
          {/* <Post
            key = {post.id}
            postObj = {post}
            updatePost={updatePost}
            audioContext={audioContext}
            user={user}
          /> */}
          {/* each post should have its own instance of a waveSurfer comp */}

        </div>
      )) : <div>Loading...</div>}
    </div>

  );
};
export default Feed;

/**
 * const test = { data: [
   {
      "id": 8,
      "userId": 2,
      "title": "The Titular2",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:43:27.289Z",
      "updatedAt": "2023-12-07T14:43:27.289Z",
      "user": {
          "id": 2,
          "username": "Rando",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": [
          {
              "id": 3,
              "userId": 1,
              "postId": 8,
              "createdAt": "2023-12-07T20:22:24.877Z",
              "updatedAt": "2023-12-07T20:22:24.877Z"
          },
          {
              "id": 5,
              "userId": 2,
              "postId": 8,
              "createdAt": "2023-12-07T21:46:16.579Z",
              "updatedAt": "2023-12-07T21:46:16.579Z"
          }
      ]
  },
  {
      "id": 10,
      "userId": 2,
      "title": "The Titular2",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:43:27.318Z",
      "updatedAt": "2023-12-07T14:43:27.318Z",
      "user": {
          "id": 2,
          "username": "Rando",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": [
          {
              "id": 4,
              "userId": 1,
              "postId": 10,
              "createdAt": "2023-12-07T21:32:52.225Z",
              "updatedAt": "2023-12-07T21:32:52.225Z"
          }
      ]
  },
  {
      "id": 2,
      "userId": 2,
      "title": "The Titular2",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:38:40.022Z",
      "updatedAt": "2023-12-07T14:38:40.022Z",
      "user": {
          "id": 2,
          "username": "Rando",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": [
          {
              "id": 6,
              "userId": 1,
              "postId": 2,
              "createdAt": "2023-12-07T21:55:25.800Z",
              "updatedAt": "2023-12-07T21:55:25.800Z"
          }
      ]
  },
  {
      "id": 5,
      "userId": 3,
      "title": "The Titular",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:39:38.649Z",
      "updatedAt": "2023-12-07T14:39:38.649Z",
      "user": {
          "id": 3,
          "username": "dom",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": []
  },
  {
      "id": 6,
      "userId": 2,
      "title": "The Titular2",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:39:38.649Z",
      "updatedAt": "2023-12-07T14:39:38.649Z",
      "user": {
          "id": 2,
          "username": "Rando",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": []
  },
  {
      "id": 4,
      "userId": 2,
      "title": "The Titular2",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:39:38.605Z",
      "updatedAt": "2023-12-07T14:39:38.605Z",
      "user": {
          "id": 2,
          "username": "Rando",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": []
  },
  {
      "id": 1,
      "userId": 3,
      "title": "The Titular",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:38:40.022Z",
      "updatedAt": "2023-12-07T14:38:40.022Z",
      "user": {
          "id": 3,
          "username": "dom",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": []
  },
  {
      "id": 3,
      "userId": 3,
      "title": "The Titular",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:39:38.605Z",
      "updatedAt": "2023-12-07T14:39:38.605Z",
      "user": {
          "id": 3,
          "username": "dom",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": []
  },
  {
      "id": 9,
      "userId": 3,
      "title": "The Titular",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:43:27.318Z",
      "updatedAt": "2023-12-07T14:43:27.318Z",
      "user": {
          "id": 3,
          "username": "dom",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": []
  },
  {
      "id": 7,
      "userId": 3,
      "title": "The Titular",
      "category": "The Categorical",
      "soundUrl": "https://storage.googleapis.com/whspr-sounds/audio/testsound.mp3",
      "createdAt": "2023-12-07T14:43:27.289Z",
      "updatedAt": "2023-12-07T14:43:27.289Z",
      "user": {
          "id": 3,
          "username": "dom",
          "profileImgUrl": "https://website.com/profile-image.jpg",
          "createdAt": "2023-12-07T14:38:40.019Z",
          "updatedAt": "2023-12-07T14:38:40.019Z"
      },
      "Likes": []
  }
]}
 */