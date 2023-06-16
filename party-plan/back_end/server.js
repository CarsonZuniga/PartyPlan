import express from 'express';
import router from './approutes.js';
import cors from 'cors';

const port = process.env.PORT || 4080;

var app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', router);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});