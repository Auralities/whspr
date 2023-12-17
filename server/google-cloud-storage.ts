import { Storage } from '@google-cloud/storage'

import { Post, Sound, Comment } from './dbmodels'

const storage = new Storage({
  keyFilename: './key.json',
  projectId: 'whspr-406622'
})


const bucket = storage.bucket('whspr-sounds')

const saveAudio = async (audio: any, userId, title: string, categories: string[]): Promise<void | string> => {
  const file = bucket.file(`audio/${Date.now()}.wav`)
  const downloadURL = `https://storage.googleapis.com/${bucket.name}/${file.name}`
  try {
    const postRecord = await Post.create({
      title,
      categories,
      userId,
      soundUrl: downloadURL,
      likeCount: 0,
      commentCount: 0,
      listenCount: 0
    })
    const postId = postRecord.get('id')
    if(!postId){
      console.error('postId not found in saveAudio')
    }
    const writeStream = file.createWriteStream({
      metadata: {
        contentType: 'audio/wav'
      }
    })
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        writeStream.on('error', (error) => {
          console.error('Error uploading audio:', error);
          reject(error);
        });
        writeStream.on('finish', () => {
          resolve();
        });
        writeStream.end(audio);
      }),
      Sound.create({
        userId, 
        postId, 
        soundUrl: downloadURL,
      }).catch((soundError) => {
        console.error('Error creating Sound record:', soundError);
      }),
    ])
    console.log('Audio saved to cloud')
  } catch (error) {
    console.error('Error handling audio upload:', error)
  }
}

const saveAudioComment = async (audio: any, userId, postId): Promise<void | string> => {
  const file = bucket.file(`audio/${Date.now()}.wav`)
  const downloadURL = `https://storage.googleapis.com/${bucket.name}/${file.name}`
  try {
    const commentRecord = await Comment.create({
      userId,
      postId,
      soundUrl: downloadURL
    })
    const commentId = await commentRecord.get('id')
    if(!commentId){
      console.error('commentId not found in saveAudioComment')
    }
    const writeStream = file.createWriteStream({
      metadata: {
        contentType: 'audio/wav'
      }
    })
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        writeStream.on('error', (error) => {
          console.error('Error uploading audio:', error);
          reject(error);
        });
        writeStream.on('finish', () => {
          resolve();
        });
        writeStream.end(audio);
      }),
      Sound.create({
        userId, 
        postId, 
        soundUrl: downloadURL,
      }).catch((soundError) => {
        console.error('Error creating Sound record:', soundError);
      }),
    ])
    console.log('Audio saved to cloud')
    return downloadURL
  } catch (error) {
    console.error('Error handling audio upload:', error)
  }
}

const getAudioUrl = async (postId: number): Promise<string | null> => {
  try {
    const soundRecord = await Sound.findOne({ where: { postId } });

    if (!soundRecord) {
      console.error('Sound record not found.');
      return null;
    }
    const soundUrl = soundRecord.get('soundUrl') as string;
    if(!soundUrl){
      console.error('Audio URL not found.')
    }
    return soundUrl;
  } catch (error) {
    console.error('Error retrieving audio URL:', error);
    return null;
  }
};



export { saveAudio, getAudioUrl, saveAudioComment }
