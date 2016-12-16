/**
 * create Dining Menue so client can choose from 
 */

'use strict';

var AWS = require("aws-sdk");


var dishesTable = "HacksterDishes";
var userChoiceTable = "CustomerDishes";
var docClient = new AWS.DynamoDB.DocumentClient();


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    // TODO implement
    
     try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        if (event.session.new) 
        {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest")
        {
            onLaunch(event.request,
                event.session, context ,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } 
        else if (event.request.type === "IntentRequest")
        {
            onIntent(event.request,
                event.session, context, 
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } 
        else if (event.request.type === "SessionEndedRequest")
        {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } 
    catch (e) 
    {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}


/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, context , callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    getWelcomeResponse(context, callback);
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

function onIntent(intentRequest, session, context,  callback) {
    
    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId 
        + " , intentName = " + intentName);


    /*
    // handle yes/no intent after the user has been prompted
    if (session.attributes && session.attributes.userPromptedToContinue) {
        delete session.attributes.userPromptedToContinue;
        if ("AMAZON.NoIntent" === intentName) {
            handleFinishSessionRequest(intent, session, callback);
        } else if ("AMAZON.YesIntent" === intentName) {
            handleRepeatRequest(intent, session, context , callback);
        }
    }
    */

    // dispatch custom intents to handlers here
    if ("AnswerIntent" === intentName) {
        handleAnswerRequest(intent, session, intentRequest , context,  callback);
    } else if ("DontKnowIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.YesIntent" === intentName) {
        getWelcomeResponse(context, callback);
    } else if ("AMAZON.NoIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.StartOverIntent" === intentName) {
        getWelcomeResponse(context, callback);
    } else if ("AMAZON.RepeatIntent" === intentName) {
        //handleRepeatRequest(intent, session, context, callback);
        getWelcomeResponse(context, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else {
        throw "Invalid intent";
    }
}
// ------- Skill specific business logic -------

var DISHES_COUNT = 4;
var CARD_TITLE = "Smart Hotel"; // Be sure to change this for your skill.

var dishes = [
    "Baked and Roasted Chicken. ",
    "Beef Steaks. ",
    "Meatloaf. ",
    "Pasta. "
    ];

function getWelcomeResponse(context, callback) 
{
    var dishesSentence = "" ;
    var dishesArray = [];
    
    readDishesFromDB( dishesSentence , dishesArray ,  function (DishesSentence,DishesArray) {
                    console.log("inside Call back of readDishes.  DishesSentence = " + DishesSentence );
                    context.succeed(prepareDishes(DishesSentence , DishesArray , callback));});
                    
    
    /*
    var dishArray = []; 
    var dishesSentence = "" ;
    prepareDishes( dishesSentence , dishArray , callback);
    */
}

function prepareDishes(dishesSentence, dishesArray, callback)
{
    var sessionAttributes = {},
        shouldEndSession = false;
        
    var    i = 0 ;
    var tmpSent = "";
    for (i = 0; i < DISHES_COUNT; i++)
    {
        tmpSent += (i+1).toString() + ", " + dishesArray[i*2] + ". " ;
    }
    
    var speechOutput = "To select a dish just say dish number. Today menu is: " + tmpSent  ;//+ "Which dish you prefer. just say dish number";
    
    var repromptText = "Dear Customer, kindly check our delicious menu for today launch to choose from. To select a dish just say it is number.";
    
    sessionAttributes = {
        "speechOutput": speechOutput,
        "repromptText": repromptText,
        "dishesArray" : dishesArray
        };
    
    console.log("session.attributes.dishesArray = " , dishesArray);
    console.log("speechOutput = " , speechOutput);
    
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function buildSpeechletResponse(title, speechOutput, repromptText, shouldEndSession) {
    console.log("buildSpeechletResponse   speechOutput = " + speechOutput);
    console.log("buildSpeechletResponse   repromptText = " + repromptText);
    
    return {
        outputSpeech: {
            type: "PlainText",
            text: speechOutput
            //type: "SSML",
            //ssml: speechOutput
        },
        card: {
            type: "Simple",
            title: title,
            content: repromptText
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
                //type: "SSML",
                //ssml: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithURL(title, speechOutput, repromptText, dishURL , shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: speechOutput
            //type: "SSML",
            //ssml: speechOutput
        },
        card: {
            type: "Standard",
            title: title,
            text: repromptText,
            image: {
                largeImageUrl:dishURL
            }

        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
                //type: "SSML",
                //ssml: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function isAnswerSlotValid(intent) {
    var answerSlotFilled = intent.slots && intent.slots.Answer && intent.slots.Answer.value;
    var answerSlotIsInt = answerSlotFilled && !isNaN(parseInt(intent.slots.Answer.value));
    return answerSlotIsInt && parseInt(intent.slots.Answer.value) < (DISHES_COUNT + 1) && parseInt(intent.slots.Answer.value) > 0;
}

function handleRepeatRequest(intent, session, context , callback) {
    // Repeat the previous speechOutput and repromptText from the session attributes if available
    // else start a new game session
    if (!session.attributes || !session.attributes.speechOutput) {
        getWelcomeResponse(context, callback);
    } else {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(session.attributes.speechOutput, session.attributes.repromptText, false));
    }
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}

function buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: speechOutput
            //type: "SSML",
            //ssml: speechOutput
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
                //type: "SSML",
                //ssml: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

function handleGetHelpRequest(intent, session, callback) {
    // Provide a help prompt for the user, explaining how the game is played. Then, continue the game
    // if there is one in progress, or provide the option to start another one.
    
    
    console.log("handleGetHelpRequest");
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }

    // Set a flag to track that we're in the Help state.
    //session.attributes.userPromptedToContinue = true;

    // Do not edit the help dialogue. This has been created by the Alexa team to demonstrate best practices.

    var speechOutput = "I'll tell you our today menu to choose from. "
            + "To choose your order, say order number, say one, two, three or four "
            + "to listen to menu again, say, start menu";
            
            
    
    var repromptText = "I'll tell you our today menu to choose from. "
            + "To choose your order, say order number,  say one, two, three or four "
            + "to listen to menu again, say, start menu";
    repromptText = speechOutput ;        
        
    var shouldEndSession = false;
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}

function handleAnswerRequest(intent, session, request , context, callback) 
{
    console.log("handleAnswerRequest" , session.attributes.dishesArray);
    
    
    var answerSlotValid = isAnswerSlotValid(intent);
    
    if (answerSlotValid === false) 
    {
        console.log("not valid answer");
        notValidAnswer(session, callback);
    }
    else
    {
        var requestID   = request.requestId     ;
        var userID      = session.user.userId   ;
    
        var selectedDish = parseInt(intent.slots.Answer.value) - 1 ;
        var dishName = session.attributes.dishesArray[ selectedDish * 2 ];
        var dishURL = session.attributes.dishesArray[ (selectedDish * 2 ) + 1 ];
        
        console.log("Dish Name = " + dishName + " , dishURL = " + dishURL );
        
        
        saveCustomerChoiceInDB(requestID , userID , dishName , function(){
                console.log("inside Call back of saveCustomerChoiceInDB.");
                context.succeed(prepareNextChoice(dishName , dishURL , callback ));
                });
    }
}

function notValidAnswer(session, callback)
{
        // If the user provided answer isn't a number > 0 and < ANSWER_COUNT,
        // return an error message to the user. Remember to guide the user into providing correct values.
        //or DontKnowIntent or AMAZON.YesIntent or AMAZON.NOIntent
        //var reprompt = session.attributes.speechOutput;
        
        var speechOutput = "Your answer must be a number between 1 and " + DISHES_COUNT + ". To try again say, start menu";
        var repromptText = "Your answer must be a number between 1 and " + DISHES_COUNT;
        //repromptText = speechOutput ;
        
        var sessionAttributes = {
        "speechOutput": speechOutput,
        "repromptText": repromptText,
        "dishesArray": session.attributes.dishesArray
        };
    
    
        callback(session.attributes,
            buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, false));
}

function prepareNextChoice(dishName , dishURL , callback)
{
    
    //reprompt = session.attributes.speechOutput;
    var speechOutput = "Great choice. Your dish will be ready in 30 minutes. Good Bye. ";
    var repromptText = "Great choice. Your dish will be ready in 30 minutes. Good Bye. ";
    repromptText = speechOutput ;
    
    var sessionAttributes = {
        "speechOutput": speechOutput,
        "repromptText": repromptText,
        };
        
    console.info("dishURL = " + dishURL);
    
    callback(sessionAttributes,
            buildSpeechletResponseWithURL(dishName, speechOutput, repromptText, dishURL , true ));
    
    /*
    callback(sessionAttributes,
            buildSpeechletResponse(dishName, speechOutput, repromptText, true ));
    */        
}

function saveCustomerChoiceInDB(requestID , userID , dishName, callback)
{
    
    var params = {
        TableName: userChoiceTable,
        Item:{
                "requestID" : requestID,
                "userID": userID,
                "dishName": dishName
            }
    };   
       
    
    console.log("Adding new Dish in DB...");
    docClient.put(params, function(err, data) {
        
        if (err)
        {
            console.error("Unable to add new requested dish. Error JSON:", JSON.stringify(err, null, 2));
        } 
        else
        {
            console.info("new dish request is Added:", JSON.stringify(data, null, 2));
        }
        
        callback();
    });
    
    console.log("at the end of saveCustomerChoiceInDB function");
}

function readDishesFromDB(dishesSentence , dishesArray ,  callback)
{
    
    var params = { 
        TableName: dishesTable,
        
        ProjectionExpression: "dishName,dishURL"
    };

    docClient.scan(params, function(err, data) {
        
        console.log("inside docClient.get to read dishes");
        
        if (err)
        {
            console.log("read dishes from DB error: " + JSON.stringify(err));
        } 
        else
        {
            console.info("read dishes from DB succeeded:", JSON.stringify(data, null, 2));
            var i = 0 ;
            dishesSentence = "";
            data.Items.forEach(function(dish) {
                console.log(dish.dishName);
                dishesSentence +=  (i+1).toString() 
                                    + " "  
                                    + dish.dishName 
                                    + " . " 
                                    ;
                dishesArray.push(dish.dishName);
                dishesArray.push(dish.dishURL);
                //dishesArray.push(" ");
                i++;
            });
            
            DISHES_COUNT = i; 
             
        }
        
        console.log("dishesSentence = " + dishesSentence);
        callback(dishesSentence , dishesArray );
    });
    
    console.log("at the end of readDishesFromDB function");
}