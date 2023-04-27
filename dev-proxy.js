import express from 'express';

const app = express();

app.use(express.json({limit: '1mb'}));

app.use('*', (req, res) => {
   console.log('PARAMS')
    console.log(req.params)

    console.log('URL')
    console.log(req.url)

    console.log('HEADERS')
    console.log(req.headers)

    console.log('BODY')
    console.log(req.body)
    res.sendStatus(200);
})


app.listen(3000)
