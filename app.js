import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import {MongoClient} from "mongodb"

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

	




		app.listen(5000 ,()=>{
		    console.log("ta funfando")
		})
