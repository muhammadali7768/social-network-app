import {kafka} from '../config/kafka.client'

const admin = kafka.admin();
const TOPICS=["chat","private_chat"]

const createTopicIfNotExist=async(topicToCreate:string)=>{
  const topicDetails = await admin.listTopics();
  console.log("List of Topics: ", topicDetails)
  if (!topicDetails.includes(topicToCreate)) {
    await admin.createTopics({
      topics: [
        {
          topic: topicToCreate,
          numPartitions: 1,
          replicationFactor: 1,
        },
      ],
    });
  } else {
    console.log(`Topic ${topicToCreate} already exists`);
  }
}
async function createTopics() {
    await admin.connect();

    for(const topic of TOPICS){
      await createTopicIfNotExist(topic)
    }
  
  
    await admin.disconnect();
}
 export {createTopics}
