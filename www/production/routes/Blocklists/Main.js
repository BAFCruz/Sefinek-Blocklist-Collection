const express=require("express"),router=express.Router(),autoIndex=require("express-autoindex"),path=require("node:path"),generated=path.join(__dirname,"..","..","..","blocklists","generated"),logs=path.join(__dirname,"..","..","public","logs"),optionsGenerated={customTemplate:path.join(__dirname,"..","..","views","autoindex","generated.html")},optionsLogs={customTemplate:path.join(__dirname,"..","..","views","autoindex","logs.html")};router.use("/generated/v1",autoIndex(generated,optionsGenerated)),router.use("/logs/v1",autoIndex(logs,optionsLogs),express.static(logs)),module.exports=router;