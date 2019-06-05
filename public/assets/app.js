$ = jQuery = require('jquery');
let findBook = require('libgenesis');
let search = $("#search-page");
let result = $("#result-page");
let loader = $(".loader");
let searchTerm = "";
result.hide();
loader.hide();

function searchNow(){
    $(".searchbar").val(searchTerm);
    let template = "";
    loader.show();
    findBook(searchTerm).then(res=>{
        console.log(res);
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
            </div>
        </div>`;
        });
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