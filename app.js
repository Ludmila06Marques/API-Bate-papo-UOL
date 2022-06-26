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



	let dbp
    let dbm

	cliente.connect().then(()=>{
	dbp=cliente.db("participants")
	})
    cliente.connect().then(()=>{
    dbm=cliente.db("messages")
    })

	

//Pegar participantes 

		app.get(``, async (req,res)=>{

            try{

            console.log("to pegando")
            const participantes= await dbp.collection("participants").find().toArray();
		    res.send(participantes)
           
            }catch(err){
                res.status(500).send("Peguei nao")
            }



		})

//Pegar mensagens
        app.get(``, async (req,res)=>{

            try {
                console.log("to pegando")
                const mensagens= await dbp.collection("messages").find().toArray();
                res.send(mensagens)
                
            } catch (err) {
                res.status(500).send("Peguei nao")                
            }

          
        })


		app.listen(5000 ,()=>{
		    console.log("ta funfando")
		})
