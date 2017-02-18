var express = require('express');
var kanjihouse_router = module.exports = express.Router();

var mongoose = require('mongoose');
var KanjihouseMail = mongoose.model("KanjihouseMail");
var Japaname = mongoose.model("Japaname");


//mongoose
//
var _ = require("underscore");
var path = require("path");

var co = require("co");



kanjihouse_router.get("/",(req,res,next)=>{
  co(function*(){
    var sent_mails = yield KanjihouseMail.find({sent:true}).sort({_id:-1}).limit(5).exec();
    var drafts = yield KanjihouseMail.find({sent:false}).limit(5).exec();

    var japanames = yield Japaname.getLatestNames(5);

    res.render("kanjihouse/index", {
      drafts,
      sent_mails,
      japanames,
    });

  }).catch(e=>next(e));
});

kanjihouse_router.get("/japanames/",(req,res,next)=>{
  co(function*(){
    //var japanames = yield Japaname.findLatestNamesOfNamer(5,req.user._id).exec();
    var japanames = yield Japaname.findLatestNames(5).exec();

    res.render("kanjihouse/japanames", {japanames});

  }).catch(e=>next(e));

});

kanjihouse_router.get("/japanames/new",(req,res,next)=>{


  var action_url = path.join(req.baseUrl, req.url);

  res.render("kanjihouse/new_japaname",{action_url});
});

kanjihouse_router.post("/japanames/new",(req,res,next)=>{

  res.redirect(path.join(req.baseUrl,"japaname"));
});

kanjihouse_router.post("/cert_mail/make",(req,res,next)=>{
  co(function*(){

    var tos = req.body.tos;
    var name =  req.body.name;

    var tos_array = _(tos.split(/,/)).map(str=>str.trim()).filter(a=>!!a);

    console.log(tos_array);
    console.log(name);

    var template = {
      title:"Name certification by Kanji House!",
      content:"Dear ____\n \n Thank you for visiting us! We published the name certification url!"
    }

    var newMail = new KanjihouseMail({
      tos:tos_array,
      name:name,
      title:template.title,
      content:template.content,
    });

    var mailDoc = yield newMail.save();
    console.log(mailDoc._id);

    var red_url = path.join(req.baseUrl, "cert_mail/drafts", mailDoc._id.toString())

    console.log("redirecting to " + red_url);

    res.redirect( red_url);
      




  }).catch(e=>next(e));



  //toをわける
  //名前はそのまま保存
  //mailをnewする。
  //todo モデル作成
  //出来上がったページにいく



});


kanjihouse_router.get("/cert_mail/make",(req,res,next)=>{
  res.render("kanjihouse/cert_mail/make");

});

kanjihouse_router.get("/cert_mail/drafts",(req,res,next)=>{
  co(function*(){

    var mails = yield KanjihouseMail.find({sent:false}).exec();

    res.render("kanjihouse/cert_mail/drafts", {mails});

  }).catch(e=>next(e));

});


kanjihouse_router.get("/cert_mail/drafts/:mail_id",(req,res,next)=>{
  co(function*(){
    var mail_id = req.params.mail_id;
    var mail = yield KanjihouseMail.findById(mail_id)
      .populate({
        path:"japanames",
        populate:{
          path:"names.ateji names.kana"
        }
      })
      .exec();

    var latest_japanames = yield Japaname.getLatestNames(10).exec();

    /*
    var latest_japanames = 
      yield Japaname.findLatestNamesOfNamer(10, req.user._id).exec();
      */

    
    res.render("kanjihouse/cert_mail/draft", {
      mail,
      action_url:path.join(req.baseUrl, req.url),
      latest_japanames,
    });

  }).catch(e=>next(e));
});


//edit
kanjihouse_router.post("/cert_mail/drafts/:mail_id",(req,res,next)=>{
  co(function*(){
    var mail_id = req.params.mail_id;

    var the_mail = yield KanjihouseMail.findById(mail_id).exec();


    var tos = req.body.tos;
      var tos_array = _(tos.split(/,/)).map(str=>str.trim()).filter(a=>!!a);;

    var name =  req.body.name;
    var title =  req.body.title;
    var content =  req.body.content;

    try{
      console.log("parsing japanames ");
      console.log(req.body.japanames);

      var japanames = JSON.parse(req.body.japanames);
    }catch(e){

      var japanames = [];
    }

    var action =  req.body.action;

    the_mail.tos = tos_array;
    the_mail.name = name;
    the_mail.title = title;
    the_mail.content  = content;
    the_mail.japanames = japanames;

    if(action == "save"){
      var saved_mail = yield the_mail.save();
      var red_url = path.join(req.baseUrl, "cert_mail/drafts", the_mail._id.toString())
      console.log("redirecting to " + red_url);

      req.flash("success", "下書きを保存しました。");

      return res.redirect(red_url)
    }
    else if(action == "send"){
      //メール送信しょり
      console.log("メールを送信しています");

      the_mail.title;

      the_mail.sent = true;
      var saved_mail = yield the_mail.save();
      //
      return res.render("kanjihouse/cert_mail/sent");
    }
    else{
      throw new Error("invalid action param");
    }
  }).catch(e=>next(e));
});


kanjihouse_router.get("/cert_mail/sent_mails",(req,res,next)=>{
  co(function*(){
    var mails = yield KanjihouseMail.find({sent:true}).exec();

    res.render("kanjihouse/cert_mail/sent_mails", {mails});

  }).catch(e=>next(e));

});



kanjihouse_router.get("/cert_mail/sent_mails/:mail_id",(req,res,next)=>{
  co(function*(){
    var mail_id = req.params.mail_id;

    var mail = yield KanjihouseMail.findById(mail_id).exec();

    res.render("kanjihouse/cert_mail/sent_mail", {
      mail,
    });

  }).catch(e=>next(e));
});
  

