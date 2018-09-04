var express = require('express');
var ConverstionV1 = require('watson-developer-cloud/assistant/v1');

var app = express();

var contexts = [];

app.get('/smsset', function (req,res){

    var message = req.query.Body;
    var number = req.query.From;
    var twilioNumber = req.query.To;

    var context = null;
    var index = 0;
    var contextIndex = 0;
    contexts.forEach(function(value) {
        console.log(value.from);
        if(value.from == number) {
            context = value.context;
            contextIndex = index;
        }
        index = index + 1;
    });

    console.log('Recevied message from ' + number + ' saying \'' + message + '\'');

    var converstion = new ConverstionV1({
        iam_apikey: 'Your API KEY',
        url: 'https://gateway-syd.watsonplatform.net/assistant/api',
        version: 'VERSION DATE'
    });

    console.log(JSON.stringify(context));
    console.log(contexts.length);

    converstion.message({
        input: { text: message },
        workspace_id:'Your Workspace ID of Watson',
        context: context
    },function(err,response){
        if(err){
            console.log(err);
        }
        else{
            console.log(response.output.text[0]);
            if(context = null){
                contexts.push({'from': number, 'context': response.context});
            }
            else{
                contexts[contextIndex].context = response.context;
            }

            var intent  = response.intents[0].intent;
            console.log(intent);
            if(intent == 'done'){
                contexts.splice(contextIndex,1);
            }
            var client = require('twilio')(
               'Twilio Auth',
               'Twilio Auth' 
            );

            client.messages.create({
                from: twilioNumber,
                to: number,
                Body: response.output.text[0]
            }, function(err,message){
                if(err){
                    console.error(err.message);
                }
            });
        }
    });

    res.send('');
});

app.listen(3000, function(){
    console.log('Example app listening on port 3000');
});
