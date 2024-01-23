import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import { useLoaderData } from 'react-router-dom';
import Post from './Post';
import WaveSurferComponent from './WaveSurfer';
import { IoPersonAdd } from 'react-icons/io5';
import { IoPersonRemoveOutline } from 'react-icons/io5';
import { Modal, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { Link, Navigate } from 'react-router-dom';

interface FollowerAttributes {
  id: number;
  username: string;
  profileImgUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
interface FollowingAttributes {
  id: number;
  username: string;
  profileImgUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
const ReadOnlyProfile = ({ audioContext }) => {
  const [selectedUserInfo, setSelectedUserInfo] = useState<any>();
  const [following, setFollowing] = useState<boolean>(false);
  const [onGridView, setOnGridView] = useState<boolean>(true);
  const [onUserProfile, setOnUserProfile] = useState<boolean>(false);
  const [onProfile, setOnProfile] = useState<boolean>(true);
  const [selectedUserFollowing, setSelectedUserFollowing] = useState<
  FollowingAttributes[]
  >([]);
  const [selectedUserFollowers, setSelectedUserFollowers] = useState<
  FollowerAttributes[]
  >([]);
  const [searchModal, setSearchModal] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [followerSearchResults, setFollowerSearchResults] = useState<
  FollowerAttributes[]
  >([]);
  const [followingSearchResults, setFollowingSearchResults] = useState<
  FollowingAttributes[]
  >([]);


  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };
  const handleSearchSubmission = async (): Promise<void> => {
    try {
      if (searchInput === '') {
        alert('Please enter a search term');
        return;
      }
      const followerResults = await axios.get(
        `/post/user/${selectedUserInfo[0].userId}/followers/search/${searchInput}`,
      );
      const followingResults = await axios.get(
        `/post/user/${selectedUserInfo[0].userId}/following/search/${searchInput}`,
      );
      setFollowerSearchResults(followerResults.data);
      setFollowingSearchResults(followingResults.data);
    } catch (error) {
      console.error('error searching for followers', error);
    }
  };

  //const [userPosts, setUserPosts]  = useState<any>()
  const { id } = useParams();
  const user: any = useLoaderData();
  const getSelectedUserInfo = async () => {
    try {
      const selectedUserObj = await axios.get(`/post/selected/${id}`);
      setSelectedUserInfo(selectedUserObj.data);
    } catch (error) {
      console.error('could not get selected user info', error);
    }
  };
  const updatePost = async (postId, updateType) => {
    try {
      const updatedPost: any = await axios.get(
        `/post/updatedPost/${postId}/${user.id}`,
      );
      const postIndex = selectedUserInfo.findIndex(
        (post) => post.id === updatedPost.data.id,
      );
      updatedPost.data.rank = selectedUserInfo[postIndex].rank;
      const postsWUpdatedPost = selectedUserInfo.toSpliced(
        postIndex,
        1,
        updatedPost.data,
      );
      setSelectedUserInfo(postsWUpdatedPost);
    } catch (error) {
      console.error('could not update post', error);
    }
  };
  const startFollowing = async (): Promise<void> => {
    try {
      const createFollowing = await axios.post('/post/startFollowing', {
        userId: user.id,
        followingId: id,
      });
      if (createFollowing.data === 'Created') {
        setFollowing(true);
      }
    } catch (error) {
      console.error('could not follow user', error);
    }
  };

  const stopFollowing = async (): Promise<void> => {
    try {
      const createFollowing = await axios.delete(
        `/post/stopFollowing/${user.id}/${id}`,
      );
      if (createFollowing.data === 'Created') {
        setFollowing(false);
      }
    } catch (error) {
      console.error('could not follow user', error);
    }
  };

  const isFollowing = async (): Promise<void> => {
    try {
      const findFollowing = await axios.get(
        `/post/isFollowing/${user.id}/${id}`,
      );
      if (findFollowing.status === 200) {
        setFollowing(true);
      }
    } catch (error: any) {
      if (error.response.status === 404) {
        setFollowing(false);
      }
      console.error('following error', error);
    }
  };
  const getSelectedUserFollowers = async (): Promise<void> => {
    try {
      const followers = await axios.get(`/post/user/${id}/followers`);
      setSelectedUserFollowers(followers.data);
    } catch (error) {
      console.error('error fetching current user followers', error);
    }
  };
  const getSelectedUserFollowing = async (): Promise<void> => {
    try {
      const followingArr = await axios.get(`/post/user/${id}/following`);
      setSelectedUserFollowing(followingArr.data);
    } catch (error) {
      console.error('error fetching current user following', error);
    }
  };
  useEffect(() => {
    getSelectedUserInfo();
    isFollowing();
    getSelectedUserFollowers();
    getSelectedUserFollowing();
  }, [id]); //update when id changes to trigger re-render for search
  return (
    <div>
      <Modal
        style={{
          backgroundColor: 'rgb(209, 209, 209, 0.6',
          textAlign: 'center',
        }}
        show={searchModal}
        onHide={() => setSearchModal(!searchModal)}
      >
        <Modal.Dialog style={{ backgroundColor: 'rgb(209, 209, 209, 0.6' }}>
          <Modal.Header closeButton>
            <Modal.Title>Search for users who follow/are followed!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={handleSearchChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setSearchModal(!searchModal)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={() => handleSearchSubmission()}>
              Search
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
        {followerSearchResults.length > 0 && (
          <div className="followers-div">
            <h3>Followers</h3>
            {followerSearchResults.map((follower) => (
              <div className="card follower-search" key={follower.id}>
                <Link
                  to={`/protected/feed/profile/${follower.id}`}
                  onClick={() => setSearchModal(false)}
                >
                  <div className="follower-info-wrap">
                    <img
                      src={follower.profileImgUrl}
                      alt="follower profile image"
                      style={{
                        borderRadius: '50%',
                        width: '100px',
                        height: '100px',
                        marginTop: '10px',
                        marginBottom: '10px',
                      }}
                    />
                    <h4>{follower.username}</h4>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
        {followingSearchResults.length > 0 && (
          <div className="followers-div">
            <h3>Following</h3>
            {followingSearchResults.map((followingUser) => (
              <div className="card follower-search" key={followingUser.id}>
                <Link
                  to={`/protected/feed/profile/${followingUser.id}`}
                  onClick={() => setSearchModal(false)}
                >
                  <div className="follower-info-wrap">
                    <img
                      src={followingUser.profileImgUrl}
                      alt="follower profile image"
                      style={{
                        borderRadius: '50%',
                        width: '100px',
                        height: '100px',
                        marginTop: '10px',
                        marginBottom: '10px',
                      }}
                    />
                    <h4>{followingUser.username}</h4>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Modal>
      {selectedUserInfo ? (
        <div
          className="card"
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div id="header" style={{ margin: '1rem' }}>
            <div className="row-container">
              <div>
                <img
                  className="profile-image"
                  style={{   
                    borderRadius: '50%',
                    width: '100px',
                    height: '100px',
                    marginTop: '10px',
                    marginBottom: '10px',
                    objectFit: 'fill',
                  }}
                  src={selectedUserInfo[0].user.profileImgUrl}
                  alt="user profile image"
                />
              </div>
              <div className="user-profile-info" style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap' }}>
                <h2 style={{ color: '#0f0c0c', fontSize: '2rem', fontFamily: 'headerFont', marginTop: '.5rem' }}>
                  {selectedUserInfo[0].user.username}
                </h2>
                <div style={{ width: '500px', overflow: 'wrap' }}>{selectedUserInfo[0].user.userBio}</div>
              </div>
              {following ? (
                <IoPersonRemoveOutline
                  //className='btn btn-light'
                  style={{
                    marginLeft: '1rem',
                    marginRight: '1rem',
                    height: '1.5rem',
                    width: '1.5rem',
                    color: 'rgb(155, 44, 22)',
                    cursor: 'pointer',
                  }}
                  onClick={() => stopFollowing()}
                ></IoPersonRemoveOutline>
              ) : (
                <IoPersonAdd
                  //className='btn btn-light'
                  style={{
                    marginLeft: '1rem',
                    marginRight: '1rem',
                    height: '1.5rem',
                    width: '1.5rem',
                    color: 'rgb(54, 89, 169)',
                    cursor: 'pointer',
                  }}
                  onClick={() => startFollowing()}
                ></IoPersonAdd>
              )}  
            </div>
            
            <div className="row-container" style={{ justifyContent: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '.5rem',
                }}
              >
                <div id='headerFont'>{selectedUserFollowing.length}</div>
                <div id='headerFont'>Following</div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: '.5rem',
                }}
              >
                <div id='headerFont' >{selectedUserFollowers.length}</div>
                <div id='headerFont' >
                  Followers{' '}
                  
                </div>
              </div>
              <FaSearch
                    style={{ marginLeft: '10px', cursor: 'pointer' }}
                    onClick={() => setSearchModal(true)}
                  />
            </div>
          </div>
          <div
            style={{
              maxWidth: '999px',
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'start',
              gap: '1rem',
            }}
          >
            {selectedUserInfo.map((post, index) => (
              <div key={index}>
                <WaveSurferComponent
                key={index}
                postObj={post}
                audioUrl={post.soundUrl}
                postId={post.id}
                userId={user.id}
                getPosts={getSelectedUserInfo}
                updatePost={updatePost}
                onProfile={onProfile}
                audioContext={audioContext}
                waveHeight={200}
                containerType='readOnly'
                // bigPost={bigPost}
                // setBigPost={setBigPost}
                // showBigPost={showBigPost}
                // setShowBigPost={setShowBigPost}
                />
                {/* each post should have its own instance of a waveSurfer comp */}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default ReadOnlyProfile;
