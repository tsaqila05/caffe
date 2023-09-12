const validator = require('validator');
const readline = require("readline");
const fs = require('fs');
const { stringify } = require('querystring');
const dataPath = './data/contacts.json';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, '[]', 'utf-8');
}
function loadContact(){
    const file = fs.readFileSync(dataPath, 'utf8');
    const contacts = JSON.parse(file);
    return contacts;
}
function isContactAlreadyExists(contacts, newContact) {
    return contacts.some(contact =>
        contact.name.toLowerCase() === newContact.name.toLowerCase() ||
        contact.hp === newContact.hp ||
        contact.email.toLowerCase() === newContact.email.toLowerCase()
    );
}
function isPhoneNumberAlreadyExists(contacts, newPhoneNumber) {
    return contacts.some(contact => contact.hp === newPhoneNumber);
}
function saveContact(name, hp, email) {
    const allowedPatterns = /^08\d{9,10}$/;

    try {
        if (!validator.matches(hp, allowedPatterns)) {
            console.log('Nomor telepon tidak valid.');
            return;
        }

        if (!validator.isEmail(email)) {
            console.log('Email tidak valid.');
            return;
        }

        const contact = { name, hp, email };
        const file = fs.readFileSync(dataPath, 'utf8'); // Menggunakan dataPath
        const contacts = JSON.parse(file);

        if (isContactAlreadyExists(contacts, contact)) {
            console.log('Kontak sudah ada dalam daftar.');
        } else {
            contacts.push(contact);
            fs.writeFileSync(dataPath, JSON.stringify(contacts)); // Menggunakan dataPath
            console.log('Kontak berhasil ditambahkan.');
        }
    } catch (err) {
        console.error('Error:', err);
    }finally {
        rl.close();
    }
}

function listContacts() {
    try {
        const contacts = loadContact();

        if (contacts.length === 0) {
            console.log('Kontak tidak tersedia !');
        } else {
            console.log('Daftar Kontak:');
            contacts.forEach((contact, index) => {
                console.log(`${index + 1}. Nama: ${contact.name}, No HP: ${contact.hp}, Email: ${contact.email}`);
            });
        }
    }catch (err){
        console.error('Error:', err);
    }finally {
        rl.close();
    }
}
function deleteContact(name) {
    try {
        const contacts = loadContact();
        const filteredContacts = contacts.filter(contact => contact.name.toLowerCase() !== name.toLowerCase());

        fs.writeFileSync(dataPath, JSON.stringify(filteredContacts), 'utf8');
        console.log(`${name} berhasil dihapus`);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        rl.close();
    }
}

module.exports = {
    saveContact,
    deleteContact,
    listContacts
};
