import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import {MongoClient , ObjectId} from "mongodb"
import joi from 'joi'

    const app=express()
	dotenv.config()
    app.use(express.json())
	app.use(cors())


	const cliente= new MongoClient(process.env.URL_MONGO)

    const data_name= joi.object({
    name:joi.string().required(),
    lastStatus: joi.number()
    })



	let dbp
  

	cliente.connect().then(()=>{
	dbp=cliente.db("participants")
	})
    cliente.connect().then(()=>{
    dbp=cliente.db("messages")
    })

    app.post(`/participants`, async(req,res)=>{
      
        const participante={
            ...req.body, 
            lastStatus: Date.now() 
        }

       const itsOk=data_name.validate(participante, {abortEarly: false})
       if(itsOk.error){
        console.log(itsOk.error.details)
            res.sendStatus(422)
            return;
        }
       
       try {
        const participantes = await dbp.collection('participants').find().toArray();
       const verify= participantes.map(item => item.name === req.body)
        if(verify){
            res.sendStatus(409)
            return;
        }else{
         await dbp.collection('participants').insertOne(participante)
         res.sendStatus(201)
            
        }
        
       } catch (error) {
        console.log(error.message)
        res.send("deu ruim")
        
       }


        res.send()
    })

    app.get(`/participants`, async (req,res)=>{

        try{

        console.log("to pegando")
        const participantes= await dbp.collection("participants").find().toArray();
        res.send(participantes)
       
        }catch(err){
            res.status(500).send("Peguei nao")
        }



    })



		app.listen(5000 ,()=>{
		    console.log("ta funfando")
		})
