

const express=require("express")
const app=express()
const date=require("date-fns/addDays")
const path=require("path")
const {open}= require("sqlite")
const sqlite3=require("sqlite3")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
app.use(express.json())

const filePath=path.join(__dirname,"database.db");

const PORT=process.env.PORT || 4000;
let db=null;
// console.log(__dirname,"./database.db")

const getDatabase= async ()=>{

  try{
   db =await open({filename:filePath,
    driver:sqlite3.Database
      
  });
  app.listen(PORT,()=>{
    console.log(`server started on port ${PORT}`);
  });
}

catch(e){
  console.log(`DB error : ${e.message}`)
  process.exit(1)
}
}

getDatabase();

//REGISTER
app.post("/register", async (request, response) => {
  const { username,password,email,phone } = request.body;
  const sql = `SELECT * FROM user
                WHERE username='${username}';`;
  const userPresentOrNot = await db.get(sql);
  if (userPresentOrNot !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else if (password.length < 5) {
    response.status(400);
    response.send("Password is too short");
  } else {
    const encryptPassword = await bcrypt.hash(password, 10);

    const sqlQuery = `INSERT INTO
                        user(username,password,email,phone)
                        VALUES
                            ( '${username}',
                            '${encryptPassword}',
                            '${email}',
                            '${phone}'
                            );`;

    const createUser = await db.run(sqlQuery);
    response.status(200);
    response.send("User created successfully");
  }
});

//LOGIN

app.post("/logins", async (request, response) => {
  const { username, password } = request.body;
  const usernameSql = `SELECT * FROM user WHERE username='${username}';`;
  const usernamePresentOrNot = await db.get(usernameSql);
  if (usernamePresentOrNot === undefined) {
    //unregistered User
    response.status(400);
    response.send("Invalid user");
  } else {
    const ispasswordMatched = await bcrypt.compare(
      password,
      usernamePresentOrNot.password
    );
    if (ispasswordMatched === true) {
      const payload = {
        username: username,
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.status(200);
      response.send({ jwt_token: jwtToken , "ok":true});
      //   response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});


//CREATE TABLE
app.get("/createTable", async (request, response) => {
  
  const detailsBox=`
  CREATE TABLE user(
    username VARCHAR(250),password VARCHAR(250),email VARCHAR(250), phone INTEGER);
  `
  const booksArray = await db.run(detailsBox);
  response.send("Database created Succuessfully")
  
});


//GET ALL USERDETAILS
app.get('/getDetails',async(request,response)=>{
  
  const datas=`SELECT * FROM user;`
  const detailing=await db.all(datas);
  response.send(detailing)
})


//DELETE TABLE
app.delete('/delete',async(request,response)=>{
  const deleteSql=`DROP TABLE user;` 
  await db.run(deleteSql)
  response.send("Table Deleted Successfully")
})



// module.exports =app;


