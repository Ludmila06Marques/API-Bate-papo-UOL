import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import {MongoClient } from "mongodb"
import joi from 'joi'
import dayjs from "dayjs"

    const app=express()
	dotenv.config()
    app.use(express.json())
	app.use(cors())
    const data= dayjs(new Date()).format('HH:mm:ss')
  

    const messageSchema=joi.object({
        to:joi.string().required(),
        text:joi.string().required(),
        type:joi.any().valid('message', 'private_message'),
        time:joi.string().required(),
        from:joi.string().required()
    

    })
    const participanteSchema = joi.object({ name: joi.string().required() })

	let db
	const cliente= new MongoClient(process.env.URL_MONGO)
	cliente.connect().then(()=>{
	db=cliente.db(process.env.API_UOL)
	})
   
    app.post("/participants", async (req, res) => {
        const participante = req.body
        const { error } = participanteSchema.validate(participante) 
        if (error) {
         res.sendStatus(422)
          return 
        } 
        try {
        const exists = await db.collection("participants").findOne({ name: participante.name })
          if (exists) {
            res.sendStatus(409)
            return 
          }
      
          await db.collection("participants").insertOne({ name: participante.name, lastStatus: Date.now() })
          await db.collection("messages").insertOne({
            from: participante.name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: data
          })
      
          res.sendStatus(201)
      
        } catch (error) {
          console.log(error)

          res.send("Entrou")
        }
      
      })

    app.get(`/participants`, async (req,res)=>{

        try{

        console.log("to pegando")
        const participantes= await db.collection("participants").find().toArray()
        res.send(participantes)
       
        }catch(err){
            res.status(500).send("Peguei nao")
        }



    })

    app.get("/messages", async (req, res) => {
        const { user } = req.headers
        const limit = parseInt(req.query.limit)
      
      
        try {
          const messages = await db.collection("messages").find().toArray()
          const filter = messages.filter(message => { const { from, to, type } = message 
            const forUser = to === "Todos" || (to === user || from === user)
            const PuclicMessage = type === "message"
            return forUser || PuclicMessage })
      
          if (limit) {
             res.send(filter.slice(-limit))
            return;
          }
      
          res.send(filter)
        } catch (error) {
         
         res.send("to pegando")
        }
      
      })

    app.post(`/messages`, async(req,res)=>{
   

      const {user }= req.headers
     
        const message={
            from:user,
            ...req.body,  
            time: data
                
        }
        const{error}=messageSchema.validate(message, {abortEarly: false})
        if(error){
            console.log(error)
                res.sendStatus(422)
                return
            }

      try {
        const participante = await db.collection("participants").findOne({ name: user })
        if (!participante) {
        return res.sendStatus(422)
        }

        await db.collection('messages').insertOne(message)
        res.sendStatus(201)
       
        
      } catch (error) {
        console.log(error.message)
        res.send("deu ruim")
      }

     


    
    })

    app.post("/status", async (req, res) => {
        const { user } = req.headers 
        try {
          const participante = await db.collection("participants").findOne({ name: user })
          if (!participante) return res.sendStatus(404)
          await db.collection("participants").updateOne({ name: user }, { $set: { lastStatus: Date.now() } })
          res.sendStatus(200)
        } catch (e) {
          console.log("Erro ao atualizar status", e)
          res.sendStatus(500)
        }
      })
      
    





		app.listen(5001 ,()=>{
		    console.log("ta funfando")
		})
