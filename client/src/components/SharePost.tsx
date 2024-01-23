import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import { RecordComment } from './RecordComment';
import WaveSurferComponent from './WaveSurferSimple';
import toast from 'react-hot-toast';
interface SharePostProps {
  userId: number;
  postObj: any;
  showShareModal: boolean;
  setShowShareModal: any;
  audioContext: AudioContext
}
export const SharePost: React.FC<SharePostProps> = ({ audioContext, userId, postObj, showShareModal, setShowShareModal }) => {
  const [followingSearchResults, setFollowingSearchResults] = useState<any>(null);
  const [searchInput, setSearchInput] = useState<string>('');
  const [sendToUserObj, setSendToUserObj] = useState<any>(null);
  const [shareComment, setShareComment] = useState<FormData>(null);
  // toast notifications
  const notifyPostShared = () => {
    toast.success('Post Shared!', {
      icon: '📨',
      style: {
        background: 'rgba(34, 221, 34, 0.785)',
      },
      position: 'top-right',
    });
  };
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {  
    setSearchInput(event.target.value);
  };
  const handleSearchSubmission = async (): Promise<void> => {
    try {
      // make a request to the server endpoint using the current user's id and the search input as identifying params to get
      // the search results for the followers and the following
      const followersQueryResults = await axios.get(
        `/post/user/${userId}/followers/search/${searchInput}`,
      );
      const followingQueryResults = await axios.get(
        `/post/user/${userId}/following/search/${searchInput}`,
      );
      // using hooks, set the search results for the followers and the following respectively
      setFollowingSearchResults(followingQueryResults.data);
    } catch (error) {
      console.error('error fetching search results', error);
    }
  };
  const handleSelectSendToUser = (userObj) => {
    setSendToUserObj(userObj);
    setFollowingSearchResults(null);
    // TODO: i think this is where the send button functionality is but i'm not sure so i'm leaving it here for now
    notifyPostShared();
  };
  return (
    <div>
    {/* //       <Modal.Header>
    //         <div style={{fontSize:'2.5rem', textShadow:'2px 2px 2px rgba(0, 0, 0, 0.5)'}}>
    //           Share with a Listener
    //         </div>
    //       </Modal.Header> */}
          <Modal.Body >
            <div style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Sharing...</div>
            <div id='header'>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>

              <img src={postObj.user.profileImgUrl}  
              className='rounded-circle'
              style={{
                width: '35px',
                height: '35px',
                margin: '10px',
                objectFit: 'fill',
                borderStyle: 'solid',
                borderColor: '#3c3556',
              }}/>
              <div>{postObj.user.username}</div>
              </div>
              <div style={{ marginLeft: '1rem', marginTop: '-1rem', fontSize: '2.5rem' }}>{postObj.title}</div>
              <WaveSurferComponent
              onShare={true}
              audioUrl={postObj.soundUrl}
              postId={postObj.id}
              audioContext={audioContext}
              type='sharePost'
              ></WaveSurferComponent>
             </div>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '2rem 0rem 1rem 0rem' }}> 
              <div style={{ marginRight: '.5rem', fontSize: '1.25rem' }}>To:</div>
              {sendToUserObj ? <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <img
                      src={sendToUserObj.profileImgUrl}
                      className='rounded-circle'
                      alt="follower profile image"
                      style={{  
                        width: '35px',
                        height: '35px',
                        margin: '10px',
                        objectFit: 'fill',
                        borderStyle: 'solid',
                        borderColor: '#3c3556',
                        
                      }}
                    />
                    <div style={{ fontSize: '1.5rem' }}>{sendToUserObj.username}</div>
              </div> : 
              <div>
              <input
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={handleSearchChange}
              />
              <button style={{ marginLeft: '1rem', padding: '.25rem' }} className='share-btn' onClick={() => handleSearchSubmission()}>
              Search
            </button>
              </div>
              }
              </div>
              {followingSearchResults 
                ? (followingSearchResults.length > 0 ? followingSearchResults.map((user) => (
                <div className='share-search-result' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                key={user.id} 
                onClick={() => handleSelectSendToUser(user)}
                >
                    <img
                      src={user.profileImgUrl}
                      alt="follower profile image"
                      className='rounded-circle'
                      style={{
                        width: '35px',
                        height: '35px',
                        margin: '.5rem 1rem .5rem 1rem',
                        objectFit: 'fill',
                        borderStyle: 'solid',
                        borderColor: '#3c3556',
                      }}
                    />
                    <div>{user.username}</div>
                  </div>
                )) : <div>no user found</div>) : <div></div> }
                {sendToUserObj ? <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ marginBottom: '1rem', width: '50%', fontSize: '1.25rem' }}>Record a Message</div>
                  <RecordComment
                  isSharing={true}
                  sentToId={sendToUserObj.id}
                  postObj={postObj}
                  userId={userId}
                  audioContext={audioContext}
                  setShowShareModal={setShowShareModal}
                  ></RecordComment>
                </div> : <div></div>}
          </Modal.Body>
          
    </div>
  );
};