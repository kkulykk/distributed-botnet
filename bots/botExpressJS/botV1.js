import axios from 'axios';
import ping from 'ping';
const botNumber = process.argv[2];

const getPing = async (target) => {
        const result = await ping.promise.probe(target, {
          timeout: 10,
          extra: ["-i", "1"],
        });

        const requestBody = {
            bot: botNumber,
            result: {
                target: result.host,
                targetAlive: result.alive,
                targetAvgPing: result.avg
            }
        }

        console.log(result);
        const res = await axios.post('http://localhost:3000/requestInfo', requestBody);
}


// for (let i = 0; i < 10; i++) {
//     setTimeout(() => getPing('www.kindacode.com'), 1000);
// }

setInterval(() => getPing('www.kindacode.com'), 1000);