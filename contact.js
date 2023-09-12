const validator = require('validator');
const readline = require("readline");
const fs = require('fs');
const { stringify } = require('querystring');
const dataPath = './data/contacts.json';
const allowedPatterns = /^08\d{9,10}$/;
const conn = require('./db');
const util = require('util');
const queryAsync = util.promisify(conn.query).bind(conn);
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
async function result(query) {
    try {
        const result = await new Promise((resolve, reject) => {
            conn.query(query, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
        return result;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

async function loadContact() {
    const query = 'SELECT name, hp, email FROM contact';
    try {
        const contacts = await result(query);
        return contacts;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

async function saveContact(name, hp, email) {
    const query = `INSERT INTO contact (name, hp, email) VALUES ('${name}', '${hp}', '${email}')`;
const values = [name, hp, email];

conn.query(query, values, (error, result) => {
    if (error) {
        console.error(error.message);
        throw error;
    } else {
        console.log('Data kontak berhasil disimpan.');
    }
})
}


function isContactAlreadyExists(contacts, newContact) {
    return contacts.some(contact =>
        contact.name.toLowerCase() === newContact.name.toLowerCase() ||
        contact.hp === newContact.hp ||
        contact.email.toLowerCase() === newContact.email.toLowerCase()
    );
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

async function editContact(name, updatedContact) {
    try {
        const existingContact = await loadContact('SELECT * FROM contact WHERE name = ?', [name]);
        if (existingContact.length === 0) {
            console.log('Kontak tidak ditemukan.');
            return false;
        }

        if (!validator.matches(updatedContact.hp, /^08\d{9,10}$/)) {
            console.log('Nomor telepon tidak valid.');
            return false;
        }
        if (!validator.isEmail(updatedContact.email)) {
            console.log('Email tidak valid.');
            return false;
        }

        const updateQuery = 'UPDATE contact SET name = ?, hp = ?, email = ? WHERE name = ?';
        const values = [updatedContact.name, updatedContact.hp, updatedContact.email, name];

        conn.query(updateQuery, values, (error, result) => {
            if (error) {
                console.error('Error:', error);
            } else {
                console.log('Kontak berhasil diperbarui.');
            }
        });

    } catch (err) {
        console.error('Error:', err);
        return false; // Terjadi kesalahan
    }
}
async function deleteContact(name) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM contact WHERE name = ?';
        conn.query(query, [name], (err, result) => {
            if (err) {
                reject(err);
            } else {
                console.log(`Menghapus kontak dengan nama: ${name}`);
                resolve(result);
            }
        });
    });
}




module.exports = {
    saveContact,
    deleteContact,
    listContacts,
    editContact,
    loadContact,
    result
};
