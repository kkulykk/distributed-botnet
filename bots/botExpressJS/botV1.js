import axios from 'axios';
const serverUrl = '';

const sendRequests = async (target, times) => {
  const statusCodes = [];
  for (let i = 0; i < times; i++) {
    const response = await axios.get(target);
    statusCodes.push(response.status);
    console.log(response.status);
  }

  const resultsObject = {
    target: target,
    status: statusCodes
  }

  return resultsObject;
}

const getTargetInfo = async (serverUrl) => {
  const response = await axios.get(serverUrl);
}

sendRequests('https://www.tumbip.com/tag/Maxwell%20Rabbit', 3);
// setInterval(() => getPing('www.kindacode.com'), 1000);