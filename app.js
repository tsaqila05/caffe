const {json} = require("express");
const validator = require('validator');
const fs= require(`fs`);
const express = require('express');
const app = express();
const port = 3000
const path = require('path');
const filePath = path.join(__dirname, 'data', 'contacts.json');
const {saveContact, deleteContact, editContact, loadContact} = require('./contact');
const conn = require('./db');

const options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now());
  }
};

app.use(express.json());
app.use(express.static('public', options));
app.use(express.urlencoded({ extended:true}));


app.set(`view engine`, `ejs`)
app.set('views', path.join(__dirname, 'views'));

app.get('/',(req,res)=>{
  res.render('home',{title:`home page`})
})
app.get('/about',(req,res)=>{
  res.render('about',{nama:`cacaa`,title:`about page`})
})
app.get('/addcontact',(req,res)=>{
  res.render('addcontact',{req, title:`contact page`})
})



app.get('/contact',async (req,res)=>{
  const contacts = await loadContact();
  console.log(contacts)
  res.render("contact",{
    title: 'Contact Page',
    cont: contacts
  })
})
app.get('/updateform/:name', async (req, res) => {
  const contactName = req.params.name;

  try {
    const contacts = await loadContact();
    const contact = contacts.find(item => item.name === contactName);
    if (!contact) {
      res.status(404).send('Contact not found');
      return;
    }

    res.render('updateform', { contact: contact, title: 'Edit Contact page' });
  } catch (err) {
    console.error('Error reading or parsing contact.json:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/add-contact', async (req,res)=>{
  const {name, hp, email} = req.body;
  try {
    await saveContact(name, hp, email);
    res.redirect('/contact?success=1');
} catch (error) {
    console.error(error.message);
    res.status(500).send('Gagal menyimpan kontak');
}
})

app.post('/update/:name', async (req, res) => {
  const contactName = req.params.name;
  const { name, hp, email } = req.body;
  const updatedData = { name, hp, email };

  if (!validator.matches(updatedData.hp, /^08\d{9,10}$/)) {
    res.send('<script>alert("Nomor telepon tidak valid."); window.location="/contact";</script>');
    return;
  }
  const success = await editContact(contactName, updatedData);
  res.redirect(`/contact`);
});


app.post('/delete-contact', async (req, res) => {
  const name = req.body.name;
  try {
      await deleteContact(name);
      console.log(`Menghapus kontak dengan nama: ${name}`);
        res.redirect('/contact');
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(500).send('Error deleting contact');
  }
});

app.get('/product/:nama',(req,res)=>{
  res.send(`product id : ${req.params.nama} kelas : ${req.query.kelas}`)
})
app.use('/',(req,res)=>{
  res.status(404)
  res.send('Page not found : 404')
})


app.listen(port, ()=>{
  console.log(`Example app listening on port ${port}`)
})


let contactsData;
try {
  const jsonData = fs.readFileSync(filePath, 'utf8');
  contactsData = JSON.parse(jsonData);
} catch (error) {
  console.error('Error reading or parsing JSON:', error);
}
for (const contact of contactsData) {
  const { name, hp, email } = contact;
  const insertQuery = `INSERT INTO contacts (name, hp, email) VALUES ('${name}', '${hp}', '${email}')`;
  connection.query(insertQuery, (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
    }
  });
}
connection.end((err) => {
  if (err) {
    console.error('Error closing connection:', err);
  } else {
    console.log('Connection closed.');
  }
});


// const validator = require('validator');
// const readline = require("readline");
// const fs = require('fs');
// const contactsFile = 'contacts.json';
// const allowedPatterns = /^08\d{9,10}$/;
// const func = require('contact');
// const yargs = require('yargs');

// yargs.command({
//   command:'add',
//   describe:'add new contact',
//   builder:{
//     name:{
//       describe:'Contact Name',
//       demandOption:true,
//       type:'string',
//     },
//     email:{
//       describe:'Email',
//       demandOption:false,
//       type:'string',
//     },
//     hp:{
//       describe:'No Handphone',
//       demandOption:true,
//       type:'string',
//     },
//   },
//   handler(argv){
//     func.saveContact(argv.name, argv.hp, argv.email);
//   },
// });
// yargs.command({
//   command: 'delete',
//   describe: 'delete a contact',
//   builder: {
//       name: {
//           describe: 'Contact Name',
//           demandOption: true,
//           type: 'string',
//       },
//   },
//   handler(argv) {
//       func.deleteContact(argv.name);
//   },
// });
// yargs.command({
//   command:'list',
//   describe:'list all contact',
//   handler(argv){
//     func.listContacts();
//   },
// });
// yargs.parse();

// async function main() {
//     let name, hp, email;

//         name = await func.askQuestion('Siapa nama mu?');
//         hp = await func.askQuestion('Berapa no hp mu?');
        
//         while (!validator.matches(hp, allowedPatterns)) {
//             console.log('Nomor telepon tidak valid.');
//             hp = await func.askQuestion('Berapa no hp mu?');
//         }

//         email = await func.askQuestion('Apa alamat email mu?');
//         while (!validator.isEmail(email)) {
//             console.log('Email tidak valid.');
//             email = await func.askQuestion('Apa alamat email mu?');
//         }
//         func.saveContact(name, hp, email);
// }

// main();