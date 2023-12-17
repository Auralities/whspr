
import React, {useEffect} from 'react';
import {
    Route,
    RouterProvider,
    createBrowserRouter,
    createRoutesFromElements,
    Outlet,
    Link,
    Routes,
    useLoaderData,
  } from 'react-router-dom';

import Login from './Login';
import Room from './Room'
import PrivateRoutes from './PrivateRoutes';
import Synthesize from './Synthesize';
import WaveSurferComponent from './WaveSurfer';
import Feed from './Feed'
import PostCard from './PostCard'
import UserProfile from './userProfile';
import ReadOnlyProfile from './ReadOnlyProfile';
import Search from './Search';
import axios from 'axios';
import aa from 'search-insights'
import { v4 as uuidv4 } from 'uuid';
import {WhsprAI} from './WhsprAI';

// THE MAIN audio context to be used throughout the application (DO NOT ALTER)
export const audioContext: AudioContext = new AudioContext();

const App = () => {
    const getUserLoader = async () => {
        try {
            const response = await axios.get('/current-user');
            // console.log('responseloader', response);
            return response.data;
        } catch(err) {
            console.error('user loader error', err)
            return null;
        }
    }


    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route>
                <Route path="/" element={<Login />} />
                <Route path="/protected" element={<PrivateRoutes />} >
                    <Route path="dashboard" element={<WaveSurferComponent />} /> // Outlet is a placeholder for child routes to be rendered
                    <Route path="WhsprAI" element={<WhsprAI audioContext={audioContext}/>} />
                    <Route path="search" element={<Search />} />
                    <Route path="profile" element={<UserProfile />} loader={() => getUserLoader()}/>
                    <Route path="feed" element={<Feed audioContext={audioContext} />} loader={() => getUserLoader()}/>
                    <Route path="post" element={<PostCard audioContext={audioContext} />} loader={() => getUserLoader()}/>
                    <Route path="synthesize" element={<Synthesize audioContext={audioContext} />} loader={() => getUserLoader()} />
                    <Route path="room" element={<Room />} />
                    <Route path="profile/:id" element={<ReadOnlyProfile audioContext={audioContext}/>} loader={() => getUserLoader()} />
                </Route>
            </Route>
        )
    )
    return (
        <RouterProvider router={router} />
    )
}

export default App;

