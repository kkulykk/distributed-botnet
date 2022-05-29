const express = require('express')
const app = express()
const port = 8000

app.get('/', (req, res) => {
    const today = new Date();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    console.log("GET: "+ time)
    res.send("Simple express local webserver")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})