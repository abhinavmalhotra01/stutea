const express=require('express');
const router = express.Router();
const {body, validationResult} = require("express-validator");
var fetchuser=require('../middleware/fetchuser');
const Answers=require('../models/Answers');
const Credits = require('../models/Credits');
const User = require('../models/User');

// ROUTE 1 : transaction : POST "/api/credits/transaction". Login Required
router.post('/transaction', fetchuser,
     async(req, res)=> {
    const {question, answer, user}=req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    try {

        const answer = await Answers.findOne({question});
        const aaidee = answer.user;
        const credit = await Credits.findOne({"user" : aaidee});
        
        if (credit==null)
        {
            const initialise = new Credits({
                user : answer.user,
                credits: 1000
            })
            const savedNote = await initialise.save();
            const star = answer.rating;
            if (answer.rating>2)
            {
                const crediti = await Credits.findOne({"user" : aaidee});
                const item = crediti.credits + 100;
                const deduction = await Credits.findOneAndUpdate({"user" : aaidee},{
                    $set : {
                        credits : item
                    }
                })

            }
            // res.json(savedNote);
        }

        else
        {
            const star = answer.rating;
            if (answer.rating>2)
            {
                const item = credit.credits + 100;
                const deduction = await Credits.findOneAndUpdate({answer},{
                    $set : {
                        credits : item
                    }
                })

            }
        }
        const debitee = req.user.id;
        const debit = await Credits.findOne({"user": debitee});
        if (debit==null)
        {
            const initialiser = new Credits({
                user : req.user.id,
                credits : 1000
            })
            const saved  = await initialiser.save();
            const debiti = await Credits.findOne({"user": debitee});
            const item2 = debiti.credits - 100;
            const less = await Credits.findOneAndUpdate({"user": debitee},{
                $set : {
                    credits: item2
                }
            })
        }

        else
        {
            const debiti = await Credits.findOne({"user": debitee});
            const item2 = debiti.credits - 100;
            const less = await Credits.findOneAndUpdate({"user": debitee},{
                $set : {
                    credits: item2
                }
            })
        }

        res.send("credits updated");
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


module.exports=router;