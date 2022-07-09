import axios from "axios";

const serverUrl = "http://54.211.202.150:3000";

/**
 * Send given amount of GET request to the given target and return response statuses
 * @param target
 * @param times
 * @returns {Promise<{target, status: *[]}>}
 */
const sendRequests = async (target, times) => {
  const statusCodes = [];

  for (let i = 0; i < times; i++) {
    try {
      const response = await axios.get(target);
      const statusCode = response.status;
      statusCodes.push(statusCode);
    } catch (err) {
      const statusErrorCode = err.response.status;
      statusCodes.push(statusErrorCode);

      console.log(statusErrorCode);
      console.log("Target GET request error.");
    }
  }
  const resultsObject = {
    target: target,
    status: statusCodes,
  };

  return resultsObject;
};

/**
 * Get target information (status, url, number of requests)
 * @param serverUrl
 * @returns {Promise<{requestNum: number, targetUrl: string, status: boolean}|{requestNum: (number|*), targetUrl: (string|*), status: *}>}
 */
const getTargetInfo = async (serverUrl) => {
  const getTargetInfoEndpoint = "/getTargetInfo";
  try {
    const response = await axios.get(serverUrl + getTargetInfoEndpoint);
    const responseData = response.data;
    const targetObject = {
      status: responseData.status,
      targetUrl: responseData.targetUrl,
      requestNum: responseData.requestNum,
    };

    return targetObject;
  } catch (err) {
    const errorObject = {
      status: false,
      targetUrl: "",
      requestNum: 0,
    };

    return errorObject;
  }
};

/**
 * Return bot statistics to the server
 * @param serverUrl
 * @param statsObject
 * @returns {Promise<void>}
 */
const sendBotStats = async (serverUrl, statsObject) => {
  const sendBotStats = "/sendBotStat";

  try {
    await axios.post(serverUrl + sendBotStats, statsObject);
  } catch (err) {
    console.log({
      message: "Stats sending failed.",
      errorInfo: err,
    });
  }
};

/**
 * Start the bot
 * @param serverUrl
 * @returns {Promise<void>}
 */
const startBot = async (serverUrl) => {
  const targetObject = await getTargetInfo(serverUrl);
  if (targetObject.status && targetObject.targetUrl) {
    // Status is true and targetUrl is NOT an empty string
    const requestInfo = await sendRequests(
      targetObject.targetUrl,
      targetObject.requestNum
    );

    await sendBotStats(serverUrl, requestInfo);
  }

  if (!targetObject.status) console.log("Server status is set to false.");
  if (targetObject.targetUrl === "") console.log("No target link specified.");
};

startBot(serverUrl);
