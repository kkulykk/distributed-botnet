import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const PORT = 3000
const app = express()

app.use(cors())
app.use(bodyParser.json());



app.post('/requestInfo', (req, res) => {
    console.log(req.body);
    res.status(200).send(req.body);
    return;
})






app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})