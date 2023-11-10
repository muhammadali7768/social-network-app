const {kafka}=require('./client')

const admin = kafka.admin();

async function createTopics(topic) {
    await admin.connect();

    const topicToCreate = `${topic}`;
    
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
  
    await admin.disconnect();
}

module.exports={createTopics}
