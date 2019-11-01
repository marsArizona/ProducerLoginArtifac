'use strict';

const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');


const app = express();



app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.post('/productor/login/user', async (req, res)=>{



    const {productor_email, productor_password} = req.body;
    const data = {email: productor_email, password: productor_password};
    fetch('http://productor.popadvise.com/api/producer/auth', {method: 'POST', body: JSON.stringify(data), headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }}).then(response => response.json())
        .then(json =>{

            if(json.type === 'success'){

                const user ={
                    name: json.producer.name,
                    id_productor: json.producer.id_producer
                };

                const producer = json.producer;

                console.log(user);
                const stringUser = JSON.stringify(user);
                const token = jwt.sign({user}, 'ticket_app');


                fetch('https://ch3ajwkeug.execute-api.us-east-2.amazonaws.com/dev/create', {method: 'POST', body: JSON.stringify({key: token, value: stringUser}), headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }}).then(response =>response.json)
                    .then(json =>{
                        const result = {
                            type: "success",
                            message: 'usuario logeado',
                            user: producer,
                            token: token
                        };
                        res.status(200).json(JSON.stringify(result));

                    });


            }else{
                const result ={
                    type: json.type,
                    message: json.message
                };
                res.status(422).json(JSON.stringify(result));
            }

        });
});


module.exports.generic = serverless(app);