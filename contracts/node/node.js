import { TronWeb } from 'tronweb';
import dotenv from "dotenv";

// Load environment variables from .env and .env.local
dotenv.config();

const fullHost = "https://api.shasta.trongrid.io";

const privateKey = "b770847f6934a854c6b67f952ef6837ffb8f8f6ce952bcc3acac57f625b6e618";

const tronWeb = new TronWeb(fullHost, privateKey);

const contractAddress = "TB7YwquuwvYw5Hy2Xi3neKq95y8FnVsvyu";

async function main() {

try {

const contract = await tronWeb.contract().at(contractAddress);

// Read current message

const currentMessage = await contract.message().call();

console.log('Current message:', currentMessage);

// Update message

const tx = await contract.setMessage("Hello from TronWeb!").send();

console.log('Transaction hash:', tx);

// Verify new message

const newMessage = await contract.message().call();

console.log('Updated message:', newMessage);

} catch (error) {

console.error(error);

}

}

main();