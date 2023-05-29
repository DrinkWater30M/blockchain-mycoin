function getLoginPage(req, res){
    res.render("login", {layout: 'authLayout'})
}

function getRegisterPage(req, res){
    res.render("register", {layout: 'authLayout'});
}
module.exports = {
    getLoginPage,
    getRegisterPage
}