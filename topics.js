let url="https://github.com/topics";
let request=require("request");
let cheerio=require("cheerio");
let fs=require("fs");
let path=require("path");
let PDFDocument = require('pdfkit');

function dirCreator(nameOfTopic){
    let full_path=path.join(__dirname,nameOfTopic);
    if(!fs.existsSync(full_path)){
        fs.mkdirSync(full_path); 
    }
}
// function createFile(repoName, topicName) {
//     let pathofFile = path.join(__dirname, topicName, repoName + ".json");
//     if (fs.existsSync(pathofFile) == false) {
//         let createStream = fs.createWriteStream(pathofFile);
//         createStream.end();
//     }
// }

request(url,cb);
function cb(error,response,html){
    if(error){
        console.log(error);
    }else{
        extractHTML(html);
    }
}
function extractHTML(html){
    let selectorTool=cheerio.load(html);
    let allTopics=selectorTool(".col-12.col-sm-6.col-md-4.mb-4");
    for(let i=0;i<allTopics.length;i++){
            let nameOfTopic=selectorTool(allTopics[i]).find(".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1").text().trim();
            let cardBtns=selectorTool(allTopics[i]).find(".no-underline.d-flex.flex-column.flex-justify-center");
            let link=selectorTool(cardBtns).attr("href");
            let fullLink="https://github.com"+link;
            getTopicDir(fullLink,nameOfTopic);
    }
}
function getTopicDir(link,nameOfTopic){
    request(link,cb);
    
    function cb(err,response,html){
        if(err){
            console.log(err);
        }else{
            extractTopicDir(html,nameOfTopic);
        }
    }
}

function extractTopicDir(html,nameOfTopic){
    let selectorTool=cheerio.load(html);
    dirCreator(nameOfTopic);
    let repo=selectorTool("a.text-bold");
    for(let i=0;i<8;i++){
        let link=selectorTool(repo[i]).attr("href");
        let repoArr=link.split("/");
        let repoName=repoArr.pop();
        // createFile(repoName,nameOfTopic);
        let fullLink="https://github.com"+link+"/issues";
        // console.log(fullLink);
        getIssues(fullLink,repoName,nameOfTopic);
    }
}
function getIssues(link,repoName,nameOfTopic){
    request(link,cb);
    
    function cb(err,response,html){
        if(err){
            console.log(err);
        }else{
            extractIssues(html,repoName,nameOfTopic);
        }
    }
}
function extractIssues(html,repoName,topicName){
    let selectorTool=cheerio.load(html);
    let issues=selectorTool(".d-block.d-md-none.position-absolute.top-0.bottom-0.left-0.right-0");
    let arr=[];
    for(let i=0;i<issues.length;i++){
        let issueName=selectorTool(issues[i]).text();
        let issueLink="https://github.com"+selectorTool(issues[i]).attr("href");
        arr.push({
            "Name":issueName,
            "Link":issueLink
        })
        let filePath=path.join(__dirname,topicName,repoName+".pdf");
        let pdfDoc = new PDFDocument;
        pdfDoc.pipe(fs.createWriteStream(filePath));
        pdfDoc.text(JSON.stringify(arr));
        pdfDoc.end();
    }
}