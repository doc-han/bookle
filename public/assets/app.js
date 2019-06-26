$ = jQuery = require('jquery');
let findBook = require('libgenesis'); 
let remote = require('electron').remote;
let search = $("#search-page");
let result = $("#result-page");
let loader = $(".loader");
let searchTerm = "";
let fileName;
result.hide();
loader.hide();
let uid = 1;

remote.getCurrentWebContents().session.on('will-download',function(event,item,content){
    //event.preventDefault();
    item.setSavePath(`${remote.app.getPath('downloads')}/Bookle/${item.getFilename()}.${item.getMimeType}`);
    item.uid = `abc${uid++}`;
    injectCode(item.getFilename(), item.uid);
    item.on('updated', (event, state) => {
        if (state === 'interrupted') {
          item.resume();
        } else if (state === 'progressing') {
          if (item.isPaused()) {
            // nothing done here
          } else {
            let t = item.getTotalBytes();
            let compl = item.getReceivedBytes();
            let p = ((compl/t) * 100).toFixed(2);
            $(`#${item.uid} .d-pro`).text(`${p}%`);
          }
        }
      })
      item.once('done', (event, state) => {
        if (state === 'completed') {
            $(`#${item.uid} .d-pro`).text(`done`);
        } else {
            $(`#${item.uid} .d-pro`).text(`error`);
        }
      })
})

function injectCode (filename, downloadId) {
    let code = `<tr id="${downloadId}">
        <td>${filename}</td>
        <td class="d-pro"></td>
    </tr>`
    $('tbody').prepend(code)
}

function searchNow(){
    $(".searchbar").val(searchTerm);
    let template = "";
    loader.show();
    findBook(searchTerm).then(res=>{
        if(res){
            res.forEach(el => {
                template += `<div class="item border-bottom">
                <div class="book-img">
                    <img src="${el.bookImage}" alt="">
                </div>
                <div class="book-info">
                        <div class="i-title">${el.title}</div>
                        <div class="i-author">${el.author}</div>
                        <div class="i-info mb-16 mt-16">
                            ${el.language} | ${el.filesize} | ${el.extension.toUpperCase()}
                        </div>
                        <div>
                        <button onclick=dl("${encodeURIComponent(el.title)}.${el.extension}","${encodeURIComponent(el.download)}") class="d-btns pr-16 pl-16 mt-16">Download</button>
                        </div>
                </div>
            </div>`;
            });
        }else{
            template = `<div class="center-text"><h3>No book found!</h3></div>`
        }
        
        $("#book-result").html(template);
        search.hide(500);
        result.show(500);
        loader.hide();
    }).catch(err=>{
        throw err;
    })
}

$("#search-btn").click(function(){
    searchNow();
});

$(".searchbar").on('keyup',function(e){
    searchTerm = $(this).val();
    console.log(searchTerm)
    if(e.keyCode==13){
        searchNow();
    }
})

function dl(filename,url){
    console.log(decodeURIComponent(url)+" Starting download!!!")
    uid++;
    remote.getCurrentWebContents().downloadURL(decodeURIComponent(url));
}


