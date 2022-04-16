import axios from 'axios';
const serverUrl = 'http://localhost:3000';

const sendRequests = async (target, times) => {
  const statusCodes = [];
  for (let i = 0; i < times; i++) {
    try {
      const response = await axios.get(target);
      statusCodes.push(response.status);
      console.log(response.status);
    } catch (err) {
      console.log("Target GET request error.");
    }
  }

  const resultsObject = {
    target: target,
    status: statusCodes
  }

  return resultsObject;
}

const getTargetInfo = async (serverUrl) => {
  const getTargetInfoEndpoint = '/getTargetInfo';
  try {
    const response = await axios.get(serverUrl + getTargetInfoEndpoint);
    const responseData = response.data;

    const targetObject = {
      status: responseData.status,
      targetUrl: responseData.targetUrl,
      requestNum: responseData.requestNum
    }

    return targetObject;
  } catch (err) {
    const errorObject = {
      status: false,
      targetUrl: '',
      requestNum: 0
    }

    return errorObject;
  }
}

const sendBotStats = async (serverUrl, statsObject) => {
  const sendBotStats = '/sendBotStat';
  try {
    await axios.post(serverUrl + sendBotStats, statsObject);
  } catch (err) {
    console.log({
      message: "Stats sending failed.",
      errorInfo: err
    })
  }
}

const startBot = async (serverUrl) => {
  const targetObject = await getTargetInfo(serverUrl);
  if (targetObject.status && targetObject.targetUrl) { // status is true and targetUrl is NOT an empty string
    const requestInfo = await sendRequests(targetObject.targetUrl, targetObject.requestNum);
    await sendBotStats(serverUrl, requestInfo);
  }

  if (!targetObject.status) {
    console.log('Server status is set to false.')
  }

  if (targetObject.targetUrl === '') {
    console.log('No target link specified.')
  }
}

startBot(serverUrl);