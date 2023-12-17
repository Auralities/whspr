import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
interface WaveSurferProps {
    audioUrl: string;
    postId: number;
    postObj: any;
    userId: number;
    getPosts: any;
    updatePost: any;
    onProfile: boolean;
    setOnProfile: any;
}

const WaveSurferComponent: React.FC<WaveSurferProps> = ({ postObj, audioUrl, postId, userId, getPosts, updatePost, onProfile, setOnProfile}) => {
    const [wave, setWave] = useState<WaveSurfer | null>(null);
    const [display, setDisplay] = useState<boolean>(false); 
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    // const { audioUrl, postId } = props;
    const containerId = `waveform-${postId || ''}`
    const createSoundWaves = () => {
        let regions: RegionsPlugin
        //if there is a wavesurfer already, destroy it
        if (wave) {
            wave.destroy();
        }
        //create the new wave
        console.log('creating new wave')
        const wavesurfer = WaveSurfer.create({
            // barWidth: 15,
            // barRadius: 5,
            // barGap: 2,
            interact: true,
            container: `#${containerId}`,
            waveColor: 'rgb(0, 255, 0)',
            progressColor: 'rgb(0, 0, 255)',
            url: audioUrl,
            width: "auto",
            height: "auto",
            normalize: true,
        });

        regions = wavesurfer.registerPlugin(RegionsPlugin.create());


        wavesurfer.on('click', () => {
            regions.addRegion({
                start: wavesurfer.getCurrentTime(),
                end: wavesurfer.getCurrentTime() + 0.25,
                drag: true,
                color: 'hsla(250, 100%, 30%, 0.5)',
                id: 'test',
            })
        })
        wavesurfer.on('finish', async () => {
            setIsPlaying(false)
            //console.log(userId)
            try {
                const addListen = await axios.post('/post/listen', {userId, postId})
                const updateListenCount = await axios.put('/post/updateCount', {column: 'listenCount', type: 'increment', id: postId})
                await updatePost(postId, userId)
                console.log('complete', updateListenCount, addListen)
            }catch(error){

            }

        })
        // wavesurfer.on('decode', () => { THIS CODE WORKS AND IS LEFT COMMENTED OUT UNTIL SOMEONE NEEDS TO USE IT,
        //     regions.addRegion({          IT ADDS A REGIONE TO THE WAVE FORM THAT THE USER CAN DRAG TO HIGHLIGHT SPECIFIC PARTS OF THE WAVE
        //         start: 0.25,         THIS WILL BE TINKERED WITH A LOT FOR USER CREATED SOUNDS
        //         end: 0.5,
        //         drag: true,
        //         color: 'hsla(250, 100%, 30%, 0.5)',
        //     })
        // })
        console.log('wave created!', wavesurfer)
        setWave(wavesurfer);
        setDisplay(true);
    }

    useEffect(() => {
        createSoundWaves();
        console.log('wave', wave);
    }, [audioUrl]);
    return (
        <div  className="card">
            <br/>
            <div className="card-body" >
                {onProfile
                    ? <a></a>
                    : <a href={`profile/${postObj.user.id}`} className="card-link">{postObj.user.username}</a>
                    }
                <h3>{postObj.title}</h3>
                {/* <div>{postObj.rank}</div> */}
                <div id={containerId}></div>
                {postObj.categories 
                ?postObj.categories.map((cat) => (
                <button 
                    className="btn btn-link" 
                    onClick={() => getPosts('explore', cat)}
                    >{`#${cat}`}</button>))
                :<div></div>
                }
                <div>{dayjs(postObj.createdAt).fromNow()}</div>
                {postObj.listenCount 
                ?<div>{`listens: ${postObj.listenCount}`}</div>
                :<div>Be the first to listen!</div>}
            {isPlaying ?
                <button type='button' className="btn btn-danger" id="play-btn" onClick={() => {
                    if (wave) {
                        wave.playPause();
                        setIsPlaying(() => !isPlaying);
                    }
                }}>Stop</button>
                : <button type='button' className="btn btn-light" id="play-btn" onClick={() => {
                    if (wave) {
                        wave.playPause();
                        setIsPlaying(() => !isPlaying);
                    }
                }}>Play</button>
            }
            <div>
                {/* <button
                className="btn"
                // onClick={()=> }
                style={{backgroundColor:'white', borderColor:'white'}}>
                <a href="#" className="card-link">{`#${postObj.category}`}</a>
                </button> */}
            </div>
            </div>
        </div>
    )
}

export default WaveSurferComponent;