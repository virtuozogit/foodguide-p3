const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
    console.log(`Current route: ${req.path}`);
})

$(document).ready(function(){
    const login = Login.findOne()

    $("#btn-truncate").click(function(){
        $("#com-1").toggleClass()
    });

    
});

function showFilter() {
    $('#offcanvasScrolling').addClass("show");
}
