

import {ChatBoot} from './util/chatBoot.js'


import express from 'express';
import cors from 'cors'

const app = express();
const port = 3000;



app.use(express.json());
app.use(cors())



app.get('/', (req, res) => {
  res.send('Hello World!');
});


const chatboot = new ChatBoot()


export default app