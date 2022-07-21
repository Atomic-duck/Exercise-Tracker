const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const connectDB = require('./connectDB.js')
const User = require('./models/User.js')

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users',async(req, res)=>{
  
  const user = await User.create({username:req.body.username, count: 0, log:[]})
  res.json({_id:user._id, username: user.username})
})

app.get('/api/users', async(req, res)=>{
  const users = await User.find({},{count: 0, log: 0})
  res.json(users)
})

app.post('/api/users/:_id/exercises',async (req, res)=>{
  const user = await User.findById(req.params._id)
  const {description, duration, date} = req.body
  let date2
  if(date){
    date2 = new Date(date)
  }
  else{
    date2 = new Date()
  }

  await User.findByIdAndUpdate(user._id,{count: user.count+1, $push: {log: {$each:[{description, duration, date: date2.toDateString()}],$sort: {date:1}}}})
  
  res.json({_id:user._id, username: user.username, description, duration: parseInt(duration), date: date2.toDateString()})
})

app.get('/api/users/:_id/logs',async (req,res)=>{
  let {from, to, limit} = req.query
  if(limit) limit = parseInt(limit)
  let today = null
  if(to == null) today = new Date()
  let {_id, username, count, log} = await User.findById(req.params._id)
  let i = 0
  
  log = log.filter(item=>{
      if(from && Date.parse(item.date) < Date.parse(from)) return false
      if(to && Date.parse(item.date) > Date.parse(to)) return false
      if(today && Date.parse(item.date) > today.getTime()) return false
      if(limit && i >= limit) return false
      i++
      return true
    })

  let user = {
    _id,
    username,
    log,
    count: i
  }
  
  if(limit) user.count = limit < i ? limit:i
  if(from) user.from = new Date(from).toDateString()
  if(to) user.to = new Date(to).toDateString()
  
  res.json(user)
})

const start = async ()=>{
  try{
    await connectDB(process.env['DB_URL'])
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port)
    })
  }catch(error){
    console.log(error)
  }
}

start()