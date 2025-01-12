import { Kafka } from "kafkajs";
import env from "dotenv";

env.config({ path: "../.env" });

const kafka = new Kafka({
  clientId: "polling-system",
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();

export const sendVoteToKafka = async (vote) => {
  console.log("sending vote to kafka by producer", vote);
  await producer.connect();
  const randomNumber = Math.floor(Math.random() * 3);
  console.log(randomNumber);
  await producer.send({
    topic: "votes",
    messages: [{ partition: randomNumber, value: JSON.stringify({ vote }) }],
  });
  console.log("Vote sent to Kafka:", vote);
};

export default producer;
