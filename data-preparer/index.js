const Datastore = require('nedb');

const db = new Datastore({ filename: '../course-catalog.db', autoload: true });
 
const https = require('https');

const { OpenAIApi } = require('openai');
const openai = new OpenAIApi(process.env.OPENAI_API_KEY);

async function get(url) {
    // allow self-signed certificates
    return new Promise((resolve, reject) => {
        https.get(url, { rejectUnauthorized: false }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', (err) => reject(err));
    });
}

async function queryClassSearch(q) {
    const url = 'https://content.osu.edu/v2/classes/search?q=' + q;
    const data = await get(url);
    const json = JSON.parse(data);
    return json.data;
}

async function getClassInfo(classId) {
    let data = await queryClassSearch(classId);
    data = data.courses[0].course
    console.log(data)
    const classInfo = {
        id: data.subject + ' ' + data.catalogNumber,
        title: data.title,
        description: data.description,
        credits: data.maxUnits,
    }
    return classInfo;
}

function isClassId(data) {
    const regex = /^[A-Z]+\s\d{4}$/;
    return regex.test(data);
}

const prereqPrompt = require('./prereqPrompt.txt');
async function getPrerquisites(description) {
    const response = await openai.complete({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system', content: prereqPrompt },
            { role: 'user', content: description },
        ],
        max_tokens: 100,
        temperature: 0.9,
    })
    const text = response.data.choices[0].text;
    console.log(text)
    return text;
}

async function main() {
    let classesToCache = [
        'CSE 2221',
        'CSE 2231',
        'PHYSICS 1251',
        'MATH 1172',
    ];

    while (classesToCache.length > 0) {
        const classId = classesToCache.pop();
        db.count({ id: classId }, async (err, count) => {
            if (count === 0) {
                const classInfo = await getClassInfo(classId);
                classInfo.prereqs = await getPrerquisites(classInfo.description);
                db.insert(classInfo);
            }
        });
    }
}

main();
