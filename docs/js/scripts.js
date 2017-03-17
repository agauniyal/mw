function parseJson(t){if(t.status>=200&&t.status<300)return t.json();var e=new Error(t.statusText);throw e.response=t,e}var projects={data:[],limit:30,offset:0,end:!1,inProgress:!1};projects.list=new Clusterize({rows:projects.data,scrollId:"app",contentId:"contentArea",callbacks:{scrollingProgress:function(t){if(t>40){projects.fetchNext()}}}}),projects.createMarkup=function(t){var e='<li><a href="';return e+=t.url,e+='" class="name">',e+=t.name,e+="</a><p>",e+=t.description,e+="</p></li>",DOMPurify.sanitize(e)},projects.fetchNext=function(){if(projects.inProgress||projects.end)return[];projects.inProgress=!0,projects.offset+=projects.limit,fetch("https://mw.now.sh/api/projects?limit="+projects.limit+"&offset="+projects.offset,{method:"GET",headers:{"Content-Type":"application/json"}}).then(parseJson).then(function(t){if(t.status){if(t.data.length<1)return void(projects.end=!0);projects.inProgress=!1;for(var e=t.data.length,n=[],o=0;o<e;++o)n.push(projects.createMarkup(data[o]));projects.list.append(n)}}).catch(function(t){})},window.onload=function(){fetch("https://mw.now.sh/api/projects?limit=50&offset=0",{method:"GET",headers:{"Content-Type":"application/json"}}).then(parseJson).then(function(t){for(var e=t.data.length,n=[],o=0;o<e;++o)n.push(projects.createMarkup(t.data[o]));projects.list.append(n)}).catch(function(t){swal({title:"Oops!",text:"Could not load data, Please reload page again!",confirmButtonText:"Ok",type:"error",showCancelButton:!1})})},document.getElementById("addProject").onclick=function(){swal.setDefaults({input:"text",confirmButtonText:"Next &rarr;",showCancelButton:!0,type:"info",allowOutsideClick:!1,progressSteps:["1","2","3","4"]});var t=[{title:"Library Name",inputValidator:function(t){return new Promise(function(e,n){if(!(t.length>0&&t.length<50))return n(t.length<1?"Empty fields are not allowed":"Limit of 50 characters exceeded");e()})}},{title:"Link to your project",text:"Or relevant issue",input:"url"},{title:"Short description",text:"No more than 500 chars",input:"textarea",inputValidator:function(t){return new Promise(function(e,n){if(!(t.length>0&&t.length<501))return n(t.length<1?"Empty fields are not allowed":"Limit of 500 characters exceeded");e()})}},{title:"Email",text:"Not required",inputValidator:function(){return new Promise(function(t,e){t()})}}];swal.queue(t).then(function(t){swal.resetDefaults(),swal({title:"Submit "+t[0]+" for review?",type:"warning",showCancelButton:!0,confirmButtonText:"Submit"}).then(function(){fetch("https://mw.now.sh/api/projects",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({Name:t[0],Url:t[1],Description:t[2],Email:t[3]})}).then(function(t){if(200!==t.status)throw new Error(t.statusText);swal({title:"Submitted for review successfully!",confirmButtonText:"Perfect!",type:"success",showCancelButton:!1})}).catch(function(t){swal({title:t.toString(),text:"Could not submit data, please try again",confirmButtonText:"Ok",type:"error",showCancelButton:!1})})})},function(){swal.resetDefaults()})};