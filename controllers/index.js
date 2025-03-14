const fsPromises = require("fs/promises");
const path = require("path");
const { v4:uuid } = require("uuid");
const dbPath = path.join(__dirname,"..","db","db.json");

async function getData(){
    return JSON.parse( await  fsPromises.readFile(dbPath,"utf-8"));
}

async function saveData(data){
    await fsPromises.writeFile(dbPath,JSON.stringify(data,null,3));
}

async function addNewIssues(req, res, next){
    const { project } = req.params;
    const savedIssues = await getData();

    const { 
        issue_title, 
        issue_text, 
        created_by, 
        assigned_to="", 
        status_text=""
    } = req.body;

    if(!issue_text || !issue_title || !created_by ) 
        return res.status(400).json({ error: 'required field(s) missing' });

    const time = new Date;
    const data = {
        _id:uuid(),
        issue_text,
        issue_title,
        created_by,
        assigned_to,
        status_text,
        open:false,
        created_on:time,
        updated_on:time
    };

    const foundProject = savedIssues[project] ?? [];

    foundProject.push(data);
    savedIssues[project] = foundProject;
    await saveData(savedIssues);
    res.json(data);
}

async function getAllIssues(req, res, next){
    const { project } = req.params;
    const savedIssues = await getData();

    let filteredResult = savedIssues[project] ?? [];

    filteredResult = filteredResult.filter((issue)=> {
        for(const key in req.query){
            if(String(issue[key]) !== req.query[key]) return false;
        }
        return true;
    });

    res.json(filteredResult);   
}


async function updateIssues(req, res, next){
    const { _id } = req.body;
    if(!_id) return res.status(400).json({ error: 'missing _id' });

    if(Object.keys(req.body).length === 1){
        return res.status(400).json({ error: 'no update field(s) sent', '_id': _id })
    }

    const { project } = req.params;
    const savedIssues = await getData();

    let projects = savedIssues[project] ?? [];

    const index = projects.findIndex((issue) => issue._id === _id);

    if(index === -1){
        return res.status(400).json({ error: 'could not update', '_id': _id });
    }

    projects[index] = { ...projects[index], ...req.body, updated_on:new Date };
    
    savedIssues[project] = projects;

    await saveData(savedIssues);
    res.json({  result: 'successfully updated', '_id': _id });
}


async function deleteIssues(req, res, next){
    const { _id } = req.body;
    if(!_id) return res.status(400).json({ error: 'missing _id' });

    const { project } = req.params;
    const savedIssues = await getData();
    let projects = savedIssues[project] ?? [];

    const index = projects.findIndex((issue) => issue._id === _id);
    if(index === -1){
        return res.status(400).json({ error: 'could not delete', '_id': _id });
    }

    projects = projects.filter((issue) => issue._id !== _id);
    
    savedIssues[project] = projects;
    await saveData(savedIssues);
    res.json({ result: 'successfully deleted', '_id': _id })
}

module.exports = {
    addNewIssues,
    getAllIssues,
    updateIssues,
    deleteIssues
}